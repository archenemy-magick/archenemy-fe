import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    console.log("🔥 Verifying reCAPTCHA token...");
    console.log("Secret key exists:", !!process.env.RECAPTCHA_SECRET_KEY);
    console.log("Token (first 20 chars):", token?.substring(0, 20));

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

    console.log("✅ Google verification response:", verifyData);

    // Return the verification result
    return NextResponse.json({
      success: verifyData.success,
      score: verifyData.score,
      action: verifyData.action,
      errorCodes: verifyData["error-codes"],
    });
  } catch (error) {
    console.error("❌ reCAPTCHA verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
