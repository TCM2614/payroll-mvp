import { NextRequest, NextResponse } from "next/server";
import { hashEmail } from "@/lib/hash";
import { storeSignup, emailExists } from "@/lib/storage";
import { sendWelcomeEmail } from "@/lib/email";

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

    // Hash email for storage
    const emailHash = await hashEmail(email);

    // Check if email already exists (prevent duplicates)
    const exists = await emailExists(emailHash);
    if (exists) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "Signup successful",
      });
    }

    // Store signup with hashed email
    await storeSignup({
      email, // Keep temporarily for welcome email
      emailHash,
      source: source || "signup-page",
      featureRequest: featureRequest || undefined,
      consent,
    });

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail({
        to: email,
        source: source || "signup-page",
      });
    } catch (emailError) {
      // Log but don't fail the request
      if (process.env.NODE_ENV === "development") {
        console.error("[Signup] Email error (non-fatal):", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Signup successful",
    });
  } catch (error) {
    // Log errors only in development
    if (process.env.NODE_ENV === "development") {
      console.error("Signup error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

