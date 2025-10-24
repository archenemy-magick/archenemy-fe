import { createServerSupabaseClient } from "~/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Trim and lowercase for consistent checking
    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      return NextResponse.json(
        { available: false, error: "Username must be at least 3 characters" },
        { status: 200 }
      );
    }

    if (normalizedUsername.length > 30) {
      return NextResponse.json(
        { available: false, error: "Username must be 30 characters or less" },
        { status: 200 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if username exists (case-insensitive)
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (error) {
      console.error("Error checking username:", error);
      return NextResponse.json(
        { error: "Failed to check username availability" },
        { status: 500 }
      );
    }

    // If data exists, username is taken
    const available = !data;

    return NextResponse.json({ available }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error checking username:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
