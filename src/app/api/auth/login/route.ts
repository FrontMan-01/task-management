import { NextRequest, NextResponse } from "next/server";
import { verifyMasterPin, createSessionToken } from "@/lib/auth-crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const { valid, error } = verifyMasterPin(pin);

    if (!valid) {
      return NextResponse.json(
        { error: error || "Invalid PIN" },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken();
    const response = NextResponse.json({ success: true, message: "Authenticated" });

    // 30 days session
    const maxAge = 60 * 60 * 24 * 30;
    response.cookies.set("dod_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Authentication system failure", details: err.message },
      { status: 500 }
    );
  }
}
