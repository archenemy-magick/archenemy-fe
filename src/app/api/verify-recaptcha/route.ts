import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Verify the token with Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const verifyData = await verifyResponse.json();

    // Return the verification result
    return NextResponse.json({
      success: verifyData.success,
      score: verifyData.score,
      action: verifyData.action,
      errorCodes: verifyData["error-codes"],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
