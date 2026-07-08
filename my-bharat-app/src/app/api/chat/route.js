import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/src/lib/db';
import UserProfile from '@/src/models/UserProfile';
import ChatSession from '@/src/models/ChatSession';
import { meshConfig } from '@/src/lib/meshClient';
import crypto from 'crypto';

const SYSTEM_PROMPT = `You are 'Suhani', a 24-year-old helpful and respectful village girl from India. You guide rural people regarding government documents (Aadhar, PAN, Passport) in pure, simple Hindi.
Follow these Strict Behavioral Rules:
1. First Interaction: If the user hasn't introduced themselves, say: 'नमस्ते! मेरा नाम सुहानी है, मैं 24 साल की हूँ। क्या मैं आपका नाम और उम्र जान सकती हूँ?'
2. Relational Addressing: Once you know their age, you MUST address them respectfully based on Indian culture. If they are around 50+: 'चाचा जी' (Uncle) or 'माँ जी' / 'आंटी जी' (Aunty). If they are 60+: 'दादा जी' or 'दादी जी'. If they are younger or your age: 'भाई' or 'बहन'. ALWAYS use these terms in subsequent replies.
3. Tech-Savviness Check: NEVER give complex website links right away. If a task requires going online (like updating Aadhar), you MUST first ask: 'क्या आपने कभी कंप्यूटर या स्मार्टफोन खुद चलाया है?'.
4. Action based on Tech Check:
   - If YES: Give simple, step-by-step website instructions.
   - If NO: Advise them to go to a nearby 'Online Cafe' or 'CSC center'. Tell them exactly what to say to the shopkeeper and warn them about the standard government fee (e.g., 'चाचा जी, ऑनलाइन वाले को सिर्फ 50 रुपये दीजिएगा, इससे ज़्यादा नहीं').
5. Tone: Keep it extremely simple, conversational, and caring. Never use heavy English words. Use female grammar when speaking about yourself (e.g. 'बताती हूँ', 'सकती हूँ', 'हूँ').
6. Contextual Echoing (VERY IMPORTANT): ALWAYS start your response by briefly and naturally acknowledging what the user just asked. For example, if the user asks 'मेरा आधार कार्ड खो गया है, क्या करूँ?', you must start with something like 'आपने आधार कार्ड खो जाने के बारे में पूछा है, चिंता मत कीजिए, मैं बताती हूँ...'. This reassures the user that you heard them correctly. Integrate this seamlessly with the relational addressing (e.g., 'चाचा जी, आपने आधार कार्ड के बारे में पूछा है...').`;

// GET: Returns the persistent conversation history for the default user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    let user = await UserProfile.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ history: [] });
    }
    return NextResponse.json({ history: user.conversationHistory });
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return NextResponse.json({ error: 'Failed to retrieve conversation history' }, { status: 500 });
  }
}

// POST: Accepts a new user message, updates database, retrieves Mesh API response, updates database, and returns AI text
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, chatId } = body;

    if (!text) {
      return NextResponse.json({ error: 'User query text is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch UserProfile and check credit limit
    let user = await UserProfile.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User profile not initialized.' }, { status: 400 });
    }

    if ((user.creditsUsed || 0) >= (user.creditLimit || 0.10)) {
      return NextResponse.json(
        { error: 'माफ़ करें, आपकी फ्री क्रेडिट लिमिट ($0.10) खत्म हो गई है।' },
        { status: 403 }
      );
    }

    // 2. Fetch or create ChatSession
    const activeChatId = chatId || crypto.randomUUID();
    let session = await ChatSession.findOne({ clerkUserId: userId, chatId: activeChatId });
    let isNew = false;
    if (!session) {
      isNew = true;
      session = await ChatSession.create({
        clerkUserId: userId,
        chatId: activeChatId,
        title: 'नई बातचीत',
        messages: []
      });
    }

    // 3. Auto-Titling: If new session, generate a Hindi title
    if (isNew) {
      try {
        const titleResponse = await fetch(`${meshConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: meshConfig.headers(),
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Summarize this prompt in 3-4 Hindi words for a chat title. Output ONLY the words, no punctuation or quotes.' },
              { role: 'user', content: text }
            ]
          })
        });
        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          const generatedTitle = titleData.choices?.[0]?.message?.content?.trim();
          if (generatedTitle) {
            session.title = generatedTitle;
          }
        }
      } catch (err) {
        console.error('Failed to generate chat title:', err);
      }
    }

    // 4. Save new user message to session
    session.messages.push({
      role: 'user',
      content: text
    });
    await session.save();

    // Format previous messages cleanly for the Mesh API request payload
    const formattedHistory = session.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // 5. Call Mesh API completions route
    const meshResponse = await fetch(`${meshConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: meshConfig.headers(),
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedHistory
        ]
      })
    });

    if (!meshResponse.ok) {
      const errorText = await meshResponse.text();
      console.error('Mesh API chat completions failed:', errorText);

      // Rollback user's latest query from database since transaction failed
      session.messages.pop();
      await session.save();

      return NextResponse.json(
        { error: `Mesh API router returned error: ${meshResponse.statusText}` },
        { status: meshResponse.status }
      );
    }

    const meshData = await meshResponse.json();
    const aiText = meshData.choices?.[0]?.message?.content;

    if (!aiText) {
      // Rollback on empty response
      session.messages.pop();
      await session.save();

      return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 500 });
    }

    // 6. Save AI response to session
    session.messages.push({
      role: 'assistant',
      content: aiText,
      cost: 0.005
    });
    await session.save();

    // 7. Update user credits by fixed amount
    user.creditsUsed = (user.creditsUsed || 0) + 0.005;
    await user.save();

    // Return response text and active chatId to frontend
    return NextResponse.json({ response: aiText, chatId: activeChatId });
  } catch (error) {
    console.error('Error in chat API handler:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}

// DELETE: Clears the conversation history from the database and optionally adds a greeting
export async function DELETE(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { greeting } = await request.json().catch(() => ({}));
    await dbConnect();
    let user = await UserProfile.findOne({ clerkUserId: userId });
    if (user) {
      user.conversationHistory = [];
      if (greeting) {
        user.conversationHistory.push({
          role: 'assistant',
          content: greeting
        });
      }
      await user.save();
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear chat history:', error);
    return NextResponse.json({ error: 'Failed to clear conversation history' }, { status: 500 });
  }
}
