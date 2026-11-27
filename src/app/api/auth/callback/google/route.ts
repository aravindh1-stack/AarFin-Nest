import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/backend/config/supabaseAdmin";
import { normalizeRole, SessionUser } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const oauthError = searchParams.get("error");

  // Determine origin from state parameter or headers
  let origin = "";
  try {
    if (stateParam) {
      const decoded = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf-8"));
      if (decoded && decoded.origin) {
        origin = decoded.origin;
      }
    }
  } catch {
    // fallback
  }

  if (!origin) {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    origin = `${proto}://${host}`;
  }

  if (oauthError || !code) {
    const errorMsg = encodeURIComponent(oauthError || "Authorization code missing from Google callback");
    return NextResponse.redirect(`${origin}/login?error=OAUTH_ERROR&message=${errorMsg}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/login?error=CONFIG_ERROR&message=${encodeURIComponent("Google OAuth credentials missing on server")}`
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/callback/google`;

    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google Token Exchange Failed:", tokenData);
      return NextResponse.redirect(
        `${origin}/login?error=OAUTH_TOKEN_FAILED&message=${encodeURIComponent("Google token verification failed")}`
      );
    }

    // 2. Fetch authenticated Google User Profile
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();

    if (!userInfoRes.ok || !googleUser.email) {
      return NextResponse.redirect(
        `${origin}/login?error=OAUTH_NO_EMAIL&message=${encodeURIComponent("Could not read email from Google account")}`
      );
    }

    const email = (googleUser.email as string).toLowerCase().trim();
    const name = googleUser.name || googleUser.given_name || email.split("@")[0];
    const picture = googleUser.picture || "";

    // 3. User Allowlist / Access Gate Verification via Supabase
    const { data: admins, error: dbError } = await supabaseAdmin
      .from("admins")
      .select("*");

    if (dbError) {
      console.error("Database query error in Google callback:", dbError);
    }

    const matchedAdmin = Array.isArray(admins)
      ? admins.find(
          (a: any) =>
            a.email && a.email.toLowerCase().trim() === email
        )
      : null;

    // Check if user is allowlisted
    if (!matchedAdmin) {
      // UNAUTHORIZED: Not in organization allowlist.
      // Redirect back to /login with PENDING_APPROVAL and email param
      const unapprovedUrl = `${origin}/login?error=PENDING_APPROVAL&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
      const pendingResponse = NextResponse.redirect(unapprovedUrl);

      // Clear any active session
      pendingResponse.cookies.delete("aarfin_session");
      pendingResponse.cookies.delete("nexfix_session");

      return pendingResponse;
    }

    // AUTHORIZED: User exists in allowlist!
    const role = normalizeRole(matchedAdmin.role);

    const sessionPayload: SessionUser = {
      id: matchedAdmin.id || "google-" + Buffer.from(email).toString("hex").slice(0, 12),
      email: matchedAdmin.email || email,
      name: matchedAdmin.full_name || name,
      role,
      avatarUrl: picture,
      provider: "google",
    };

    // Route target based on role
    const destinationPath = role === "EDITOR" ? "/dashboard/collections" : "/dashboard";
    const successResponse = NextResponse.redirect(`${origin}${destinationPath}`);

    // Set cookies
    successResponse.cookies.set("aarfin_session", "authenticated", {
      path: "/",
      maxAge: 86400 * 7,
      sameSite: "lax",
      httpOnly: false,
    });

    successResponse.cookies.set("nexfix_session", JSON.stringify(sessionPayload), {
      path: "/",
      maxAge: 86400 * 7,
      sameSite: "lax",
      httpOnly: false,
    });

    return successResponse;
  } catch (err: any) {
    console.error("Google OAuth Callback Exception:", err);
    return NextResponse.redirect(
      `${origin}/login?error=AUTH_EXCEPTION&message=${encodeURIComponent(err.message || "Authentication error")}`
    );
  }
}
