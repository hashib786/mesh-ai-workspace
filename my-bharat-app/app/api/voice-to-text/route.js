import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/db';
import UserProfile from '@/src/models/UserProfile';

export async function POST(request) {
  try {
    const formData = await request.formData();
    // Accept audio file from either 'file' or 'audio' field
    const file = formData.get('file') || formData.get('audio');

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided in the "file" or "audio" field.' },
        { status: 400 }
      );
    }

    // Construct FormData to send to Mesh API
    const meshFormData = new FormData();
    // Append the file and specify the model requested: sarvam/saaras:v2
    meshFormData.append('file', file, file.name || 'audio.wav');
    meshFormData.append('model', 'sarvam/saaras:v2');

    // Call the Mesh API audio transcription endpoint
    const meshResponse = await fetch('https://api.meshapi.ai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MESH_API_KEY || ''}`,
      },
      body: meshFormData,
    });

    if (!meshResponse.ok) {
      const errorText = await meshResponse.text();
      console.error('Mesh API Error response:', errorText);

      // Handle specific billing limit error (HTTP 402 / spend_limit_exceeded)
      if (meshResponse.status === 402) {
        return NextResponse.json(
          { error: 'Mesh API spend limit exceeded. Please check your MeshAPI dashboard.' },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: `Mesh API request failed with status ${meshResponse.status}: ${meshResponse.statusText}` },
        { status: meshResponse.status }
      );
    }

    const meshData = await meshResponse.json();
    const transcribedText = meshData.text;

    if (!transcribedText) {
      return NextResponse.json(
        { error: 'Transcription result was empty.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: transcribedText });
  } catch (error) {
    console.error('Error in voice-to-text API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
}
