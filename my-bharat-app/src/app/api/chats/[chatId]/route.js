import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/src/lib/db";
import ChatSession from "@/src/models/ChatSession";

export async function GET(request, { params }) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Await route params in Next.js 15+
    const { chatId } = await params;

    // 3. Connect to database
    await dbConnect();

    // 4. Retrieve specific chat session
    const session = await ChatSession.findOne({ clerkUserId: userId, chatId });
    if (!session) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      messages: session.messages,
      title: session.title,
    });
  } catch (error) {
    console.error("Error in chat details GET API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
