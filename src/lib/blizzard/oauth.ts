import "server-only";

import { OAUTH_HOSTS, type Region } from "./regions";

type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

const cache = new Map<Region, CachedToken>();
const inflight = new Map<Region, Promise<CachedToken>>();

function creds(): { id: string; secret: string } {
  const id = process.env.BATTLE_NET_CLIENT_ID;
  const secret = process.env.BATTLE_NET_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "Battle.net credentials missing. Set BATTLE_NET_CLIENT_ID and BATTLE_NET_CLIENT_SECRET in your environment."
    );
  }
  return { id, secret };
}

export function isBlizzardConfigured(): boolean {
  return Boolean(process.env.BATTLE_NET_CLIENT_ID && process.env.BATTLE_NET_CLIENT_SECRET);
}

async function fetchToken(region: Region): Promise<CachedToken> {
  const { id, secret } = creds();
  const host = OAUTH_HOSTS[region];
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch(`https://${host}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Battle.net token request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const body = (await res.json()) as TokenResponse;
  const expiresInMs = body.expires_in * 1000;
  const expiresAt = Date.now() + expiresInMs - 60_000;

  return { accessToken: body.access_token, expiresAt };
}

export async function getAccessToken(region: Region): Promise<string> {
  const now = Date.now();
  const cached = cache.get(region);

  if (cached && cached.expiresAt > now) {
    return cached.accessToken;
  }

  let promise = inflight.get(region);
  if (!promise) {
    promise = fetchToken(region)
      .then((token) => {
        cache.set(region, token);
        return token;
      })
      .finally(() => {
        inflight.delete(region);
      });
    inflight.set(region, promise);
  }

  const token = await promise;
  return token.accessToken;
}
