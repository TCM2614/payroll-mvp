import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, consent, featureRequest, source } = body;

    if (!email || !consent) {
      return NextResponse.json(
        { error: "Email and consent are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual webhook integration
    // Example: Notion API, Brevo, Mailchimp, etc.
    
    // For now, just log the signup (in production, save to database/webhook)
    console.log("New signup:", {
      email,
      consent,
      featureRequest: featureRequest || null,
      source: source || "signup-page",
      timestamp: new Date().toISOString(),
    });

    // Example webhook call (uncomment and configure when ready):
    /*
    const webhookUrl = process.env.NOTION_WEBHOOK_URL || process.env.BREVO_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          consent,
          featureRequest: featureRequest || null,
          source: source || "signup-page",
          timestamp: new Date().toISOString(),
        }),
      });
    }
    */

    return NextResponse.json({
      success: true,
      message: "Signup successful",
      email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

