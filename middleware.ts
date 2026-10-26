import { NextRequest, NextResponse } from "next/server";

async function verifySessionTokenEdge(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, sigB64] = parts;

    // Decode and check expiration
    const payloadStr = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadStr);
    if (!payload.authed || !payload.exp || Date.now() > payload.exp) {
      return false;
    }

    // Verify HMAC-SHA256 signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
    const uint8 = new Uint8Array(sigBytes);
    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const sigCalculated = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return sigCalculated === sigB64;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Unprotected public paths and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/login" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  const isProd = process.env.NODE_ENV === "production";
  const pinConfigured = Boolean(process.env.APP_PIN || process.env.APP_PIN_HASH || isProd);

  // If PIN protection is active
  if (pinConfigured) {
    const sessionSecret = process.env.SESSION_SECRET;

    if (!sessionSecret) {
      if (isProd) {
        console.error(
          "CRITICAL SECURITY ERROR: SESSION_SECRET environment variable is missing in production."
        );
        return new NextResponse(
          JSON.stringify({
            error: "Server security misconfiguration: SESSION_SECRET is missing in production.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const sessionToken = req.cookies.get("dod_session")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifySessionTokenEdge(sessionToken, sessionSecret);
    if (!isValid) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("dod_session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
