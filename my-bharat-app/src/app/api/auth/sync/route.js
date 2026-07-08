import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/src/lib/db";
import UserProfile from "@/src/models/UserProfile";

export async function GET() {
  try {
    // 1. Fetch user profile context from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect to MongoDB instance
    await dbConnect();

    // 3. Find or initialize profile document
    let dbUser = await UserProfile.findOne({ clerkUserId: user.id });

    if (!dbUser) {
      const email =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ||
        user.emailAddresses[0]?.emailAddress ||
        "";
      const name = user.firstName || "";

      dbUser = await UserProfile.create({
        clerkUserId: user.id,
        name: name,
        email: email,
        language: "hi-IN",
        locationType: "village",
        conversationHistory: [],
      });
    }

    return NextResponse.json({
      success: true,
      user: { name: dbUser.name, email: dbUser.email },
    });
  } catch (error) {
    console.error("Error in sync API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
