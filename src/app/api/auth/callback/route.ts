import { NextResponse } from "next/server";
import {
  encodeSessionCookie,
  exchangeUserToken,
  isUserOAuthConfigured,
  SESSION_COOKIE,
  type UserSession,
} from "@/lib/blizzard/oauth";
import { parseRegion, type Region } from "@/lib/blizzard/regions";

export async function GET(request: Request) {
  if (!isUserOAuthConfigured()) {
    return NextResponse.json(
      { error: "OAuth utilisateur non configuré." },
      { status: 503 }
    );
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("bnet_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    const err = url.searchParams.get("error_description") ?? url.searchParams.get("error") ?? "Échec de l'autorisation.";
    return NextResponse.redirect(new URL(`/stats/wow?oauth_error=${encodeURIComponent(err)}`, url));
  }

  const parts = state.split(":");
  const region: Region = parseRegion(parts[0]);
  const returnTo = parts[1] ?? "/stats/wow";

  try {
    const token = await exchangeUserToken(region, code);
    const session: UserSession = {
      region,
      accessToken: token.access_token,
      expiresAt: Date.now() + token.expires_in * 1000,
      accountId: token.sub,
    };
    const res = NextResponse.redirect(new URL(returnTo, url));
    res.cookies.set(SESSION_COOKIE, encodeSessionCookie(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: token.expires_in,
      path: "/",
    });
    res.cookies.delete("bnet_oauth_state");
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échange de token échoué.";
    return NextResponse.redirect(new URL(`/stats/wow?oauth_error=${encodeURIComponent(message)}`, url));
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete("bnet_oauth_state");
  return res;
}
