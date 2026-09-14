import "server-only";

import { blizzardGet, namespaceFor } from "./client";
import { type Locale } from "./regions";
import type { ConnectedRealm, ConnectedRealmsIndex } from "./types";

export async function getConnectedRealmsIndex(region: Parameters<typeof blizzardGet>[0]["region"]): Promise<{
  hrefs: string[];
}> {
  const data = await blizzardGet<ConnectedRealmsIndex>({
    region,
    namespace: namespaceFor(region ?? "eu", "dynamic"),
    path: "/data/wow/connected-realm/index",
    revalidate: 60,
  });
  return { hrefs: data.connected_realms.map((r) => r.href) };
}

function pickLocal(field: { [locale: string]: string } | undefined, fallback: string): string {
  if (!field) return fallback;
  return field.en_US ?? field.en_GB ?? Object.values(field)[0] ?? fallback;
}

export type ConnectedRealmSummary = {
  id: number;
  hasQueue: boolean;
  statusType: string;
  statusName: string;
  populationType: string;
  populationName: string;
  realms: { name: string; slug: string }[];
};

export async function getConnectedRealm(
  region: Parameters<typeof blizzardGet>[0]["region"],
  href: string,
  locale?: Locale
): Promise<ConnectedRealmSummary> {
  const data = await blizzardGet<ConnectedRealm>({
    region,
    namespace: namespaceFor(region ?? "eu", "dynamic"),
    path: new URL(href).pathname,
    locale,
    revalidate: 60,
  });

  return {
    id: data.id,
    hasQueue: data.has_queue,
    statusType: data.status.type,
    statusName: pickLocal(data.status.name, data.status.type),
    populationType: data.population.type,
    populationName: pickLocal(data.population.name, data.population.type),
    realms: data.realms.map((r) => ({ name: pickLocal(r.name, r.slug), slug: r.slug })),
  };
}
