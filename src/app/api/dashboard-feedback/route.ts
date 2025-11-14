import { NextRequest, NextResponse } from "next/server";

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
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // TODO: Replace with actual webhook integration
    // Example: Notion API, Brevo, Mailchimp, Google Sheets API, etc.
    
    // Log only in development (in production, save to database/webhook)
    if (process.env.NODE_ENV === "development") {
      console.log("Dashboard feedback:", {
        email: email || null,
        feedback: feedback.trim(),
        source: source || "dashboard-preview",
        timestamp: new Date().toISOString(),
      });
    }

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


