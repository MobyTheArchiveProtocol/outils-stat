import "server-only";

import { OAUTH_HOSTS, REGIONS, type Region } from "./regions";

type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

type UserTokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  scope?: string;
  sub?: string;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

const cache = new Map<Region, CachedToken>();
const inflight = new Map<Region, Promise<CachedToken>>();

function readCred(name: string): string | undefined {
  const value = process.env[name];
  return value ? value.trim() : undefined;
}

function creds(): { id: string; secret: string } {
  const id = readCred("BATTLE_NET_CLIENT_ID");
  const secret = readCred("BATTLE_NET_CLIENT_SECRET");
  if (!id || !secret) {
    throw new Error(
      "Battle.net credentials missing. Set BATTLE_NET_CLIENT_ID and BATTLE_NET_CLIENT_SECRET in your environment."
    );
  }
  return { id, secret };
}

export function isBlizzardConfigured(): boolean {
  return Boolean(readCred("BATTLE_NET_CLIENT_ID") && readCred("BATTLE_NET_CLIENT_SECRET"));
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

export const OAUTH_SCOPES = ["wow.profile"];

export function userRedirectUri(): string | null {
  return readCred("BATTLE_NET_REDIRECT_URI") ?? null;
}

export function isUserOAuthConfigured(): boolean {
  return Boolean(readCred("BATTLE_NET_CLIENT_ID") && readCred("BATTLE_NET_REDIRECT_URI"));
}

export function buildAuthorizeUrl(region: Region, state: string): string | null {
  if (!isUserOAuthConfigured()) return null;
  const { id } = creds();
  const host = OAUTH_HOSTS[region];
  const params = new URLSearchParams({
    client_id: id,
    scope: OAUTH_SCOPES.join(" "),
    state,
    redirect_uri: readCred("BATTLE_NET_REDIRECT_URI")!,
    response_type: "code",
  });
  return `https://${host}/authorize?${params.toString()}`;
}

export async function exchangeUserToken(
  region: Region,
  code: string
): Promise<UserTokenResponse> {
  const { id, secret } = creds();
  const host = OAUTH_HOSTS[region];
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    scope: OAUTH_SCOPES.join(" "),
    code,
    redirect_uri: readCred("BATTLE_NET_REDIRECT_URI")!,
  });

  const res = await fetch(`https://${host}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Battle.net token exchange failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return (await res.json()) as UserTokenResponse;
}

export type UserSession = {
  region: Region;
  accessToken: string;
  expiresAt: number;
  accountId?: string;
};

export const SESSION_COOKIE = "bnet_session";

function sessionSecret(): string {
  return readCred("SESSION_SECRET") ?? "dev-insecure-secret-change-me";
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function xorCipher(input: string, secret: string, encrypt: boolean): string {
  const data = enc.encode(input);
  const key = enc.encode(secret);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  const bytes = encrypt ? out : out;
  return encrypt ? Buffer.from(bytes).toString("base64") : dec.decode(bytes);
}

export function encodeSessionCookie(session: UserSession): string {
  const payload = JSON.stringify(session);
  return xorCipher(payload, sessionSecret(), true);
}

export function decodeSessionCookie(raw: string | undefined): UserSession | null {
  if (!raw) return null;
  try {
    const json = xorCipher(raw, sessionSecret(), false);
    const parsed = JSON.parse(json) as UserSession;
    if (!parsed || typeof parsed.accessToken !== "string" || !parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function validRegions(): Region[] {
  return REGIONS;
}
