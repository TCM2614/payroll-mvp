import { NextRequest, NextResponse } from "next/server";
import { hashEmail } from "@/lib/hash";
import { storeFeedback } from "@/lib/storage";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, feedback, source } = body;

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: "Feedback is required" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    let emailHash: string | undefined;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      // Hash email for storage
      emailHash = await hashEmail(email);
    }

    // Store feedback with hashed email
    await storeFeedback({
      email: email || undefined, // Keep temporarily if needed for follow-up
      emailHash,
      feedback: feedback.trim(),
      source: source || "dashboard-preview",
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    // Log errors only in development
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard feedback error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


