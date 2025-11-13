import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hourly = searchParams.get("hourly");
  const takeHome = searchParams.get("takeHome");

  if (!hourly || !takeHome) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Generate summary
  const summary = `At £${hourly} hourly, you take home £${takeHome} annually.`;

  // In production, you could call GPT API here:
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: 'Generate a brief summary for UK payroll calculations.',
  //       },
  //       {
  //         role: 'user',
  //         content: `At £${hourly} hourly, calculate take-home pay annually.`,
  //       },
  //     ],
  //   }),
  // });

  return NextResponse.json({
    summary,
    hourly: parseFloat(hourly),
    takeHome: parseFloat(takeHome),
    timestamp: new Date().toISOString(),
  });
}

