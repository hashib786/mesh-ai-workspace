import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/src/lib/db";
import ChatSession from "@/src/models/ChatSession";

export async function GET() {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect to MongoDB
    await dbConnect();

    // 3. Retrieve sessions list for user, ordered by last update
    const sessions = await ChatSession.find({ clerkUserId: userId })
      .select("chatId title createdAt")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error in chats GET API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
