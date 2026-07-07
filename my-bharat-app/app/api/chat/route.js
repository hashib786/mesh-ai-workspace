import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/db';
import UserProfile from '@/src/models/UserProfile';
import { meshConfig } from '@/src/lib/meshClient';

const SYSTEM_PROMPT = `You are 'Aman', a 24-year-old helpful and respectful village youth from India. You guide rural people regarding government documents (Aadhar, PAN, Passport) in pure, simple Hindi.
Follow these Strict Behavioral Rules:
1. First Interaction: If the user hasn't introduced themselves, say: 'नमस्ते! मेरा नाम अमन है, मैं 24 साल का हूँ। क्या मैं आपका नाम और उम्र जान सकता हूँ?'
2. Relational Addressing: Once you know their age, you MUST address them respectfully based on Indian culture. If they are around 50+: 'चाचा जी' (Uncle) or 'माँ जी' / 'आंटी जी' (Aunty). If they are 60+: 'दादा जी' or 'दादी जी'. If they are younger or your age: 'भाई' or 'बहन'. ALWAYS use these terms in subsequent replies.
3. Tech-Savviness Check: NEVER give complex website links right away. If a task requires going online (like updating Aadhar), you MUST first ask: 'क्या आपने कभी कंप्यूटर या स्मार्टफोन खुद चलाया है?'.
4. Action based on Tech Check:
   - If YES: Give simple, step-by-step website instructions.
   - If NO: Advise them to go to a nearby 'Online Cafe' or 'CSC center'. Tell them exactly what to say to the shopkeeper and warn them about the standard government fee (e.g., 'चाचा जी, ऑनलाइन वाले को सिर्फ 50 रुपये दीजिएगा, इससे ज़्यादा नहीं').
5. Tone: Keep it extremely simple, conversational, and caring. Never use heavy English words.`;

// GET: Returns the persistent conversation history for the default user
export async function GET() {
  try {
    await dbConnect();
    let user = await UserProfile.findOne();
    if (!user) {
      user = await UserProfile.create({
        name: 'Rural User',
        language: 'hi-IN',
        locationType: 'village',
        conversationHistory: []
      });
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
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'User query text is required' }, { status: 400 });
    }

    await dbConnect();
    let user = await UserProfile.findOne();
    if (!user) {
      user = await UserProfile.create({
        name: 'Rural User',
        language: 'hi-IN',
        locationType: 'village',
        conversationHistory: []
      });
    }

    // 1. Save new user message to Mongoose History if it was not already logged by STT
    const lastMsg = user.conversationHistory[user.conversationHistory.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== text) {
      user.conversationHistory.push({
        role: 'user',
        content: text
      });
      await user.save();
    }

    // Format previous messages cleanly for the Mesh API request payload
    const formattedHistory = user.conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // 2. Call Mesh API completions route
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
      user.conversationHistory.pop();
      await user.save();

      return NextResponse.json(
        { error: `Mesh API router returned error: ${meshResponse.statusText}` },
        { status: meshResponse.status }
      );
    }

    const meshData = await meshResponse.json();
    const aiText = meshData.choices?.[0]?.message?.content;

    if (!aiText) {
      // Rollback on empty response
      user.conversationHistory.pop();
      await user.save();

      return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 500 });
    }

    // 3. Save AI response to Mongoose History
    user.conversationHistory.push({
      role: 'assistant',
      content: aiText
    });
    await user.save();

    // 4. Return response text to frontend
    return NextResponse.json({ response: aiText });
  } catch (error) {
    console.error('Error in chat API handler:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
