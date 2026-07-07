import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/db';
import UserProfile from '@/src/models/UserProfile';
import { meshConfig } from '@/src/lib/meshClient';

const SYSTEM_PROMPT = "You are 'Jan-Sathi', a highly helpful, polite, and completely Hindi-speaking AI assistant for rural Indian users. You guide them about government documents like Aadhar, PAN, and Passports. Keep answers short, extremely simple, respectful, and always add a small warning at the end protecting them from scams/bribes by local middlemen.";

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
