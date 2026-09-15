import "server-only";

import { getAccessToken } from "./oauth";
import { API_HOSTS, REGION_LOCALES, type Locale, type Region } from "./regions";

export class BlizzardApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "BlizzardApiError";
    this.status = status;
  }
}

type RequestOptions = {
  region?: Region;
  namespace: string;
  path: string;
  searchParams?: Record<string, string | number | boolean | undefined>;
  locale?: Locale;
  revalidate?: number;
};

function buildUrl(region: Region, path: string, params: URLSearchParams): string {
  const host = API_HOSTS[region];
  const search = params.toString();
  return `https://${host}${path}${search ? `?${search}` : ""}`;
}

export async function blizzardGet<T>(opts: RequestOptions): Promise<T> {
  const region = opts.region ?? "eu";
  const locale = opts.locale ?? REGION_LOCALES[region];

  const params = new URLSearchParams();
  params.set("namespace", opts.namespace);
  params.set("locale", locale);
  for (const [key, value] of Object.entries(opts.searchParams ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }

  const accessToken = await getAccessToken(region);
  const res = await fetch(buildUrl(region, opts.path, params), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: opts.revalidate !== undefined ? "force-cache" : "no-store",
    next: opts.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
  });

  if (res.status === 404) {
    throw new BlizzardApiError(404, "Not found");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new BlizzardApiError(res.status, `Battle.net request failed: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as T;
}

export function namespaceFor(region: Region, kind: "dynamic" | "profile" | "static"): string {
  return `${kind}-${region}`;
}
