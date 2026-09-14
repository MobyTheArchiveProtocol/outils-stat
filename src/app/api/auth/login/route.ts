import { NextResponse } from "next/server";
import { buildAuthorizeUrl, isUserOAuthConfigured } from "@/lib/blizzard/oauth";
import { parseRegion } from "@/lib/blizzard/regions";

export async function GET(request: Request) {
  if (!isUserOAuthConfigured()) {
    return NextResponse.json(
      { error: "OAuth utilisateur non configuré. Définissez BATTLE_NET_CLIENT_ID et BATTLE_NET_REDIRECT_URI." },
      { status: 503 }
    );
  }
  const url = new URL(request.url);
  const region = parseRegion(url.searchParams.get("region"));
  const returnTo = url.searchParams.get("returnTo") ?? "/stats/wow";
  const state = `${region}:${returnTo}:${crypto.randomUUID()}`;
  const authorizeUrl = buildAuthorizeUrl(region, state);
  if (!authorizeUrl) {
    return NextResponse.json({ error: "Configuration OAuth incomplète." }, { status: 503 });
  }
  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set("bnet_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return res;
}
