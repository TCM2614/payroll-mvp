import { NextRequest, NextResponse } from "next/server";
import { hashEmail } from "@/lib/hash";
import { storeSignup, emailExists } from "@/lib/storage";
import { sendWelcomeEmail } from "@/lib/email";
import { logError, logInfo, logWarn } from "@/lib/logger";

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
      logInfo("Welcome email sent", { to: email, source: source || "signup-page" });
    } catch (emailError) {
      logError("Failed to send welcome email (non-fatal)", emailError, { to: email });
      // Don't fail the request if email fails
    }

    logInfo("Signup successful", { emailHash, source: source || "signup-page" });

    return NextResponse.json({
      success: true,
      message: "Signup successful",
    });
  } catch (error) {
    logError("Signup error", error, { endpoint: "/api/signup" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

