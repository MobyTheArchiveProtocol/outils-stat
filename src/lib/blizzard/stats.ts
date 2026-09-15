import "server-only";

import { DEFAULT_REGION, parseRegion, type Region, REGION_LOCALES } from "./regions";
import { getConnectedRealm, getConnectedRealmsIndex, type ConnectedRealmSummary } from "./wow";
import type { RegionStat } from "./types";

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = await fn(items[i], i);
      } catch {
        results[i] = undefined as unknown as R;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export async function getWowRegionStats(rawRegion: string | null | undefined): Promise<RegionStat> {
  const region: Region = parseRegion(rawRegion);
  const locale = REGION_LOCALES[region];
  const { hrefs } = await getConnectedRealmsIndex(region);

  const summaries = await mapPool(hrefs, 12, (href) => getConnectedRealm(region, href, locale));
  const valid = summaries.filter((s): s is ConnectedRealmSummary => Boolean(s));

  const byStatus: Record<string, number> = {};
  const byPopulation: Record<string, number> = {};
  let online = 0;
  let queued = 0;

  const flat = valid.flatMap((s) =>
    s.realms.map((r) => ({
      name: r.name,
      slug: r.slug,
      status: s.statusType,
      statusName: s.statusName,
      population: s.populationType,
      populationName: s.populationName,
      hasQueue: s.hasQueue,
    }))
  );

  for (const r of flat) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    byPopulation[r.population] = (byPopulation[r.population] ?? 0) + 1;
    if (r.status === "UP") online += 1;
    if (r.hasQueue) queued += 1;
  }

  const topRealms = flat
    .sort((a, b) => Number(b.hasQueue) - Number(a.hasQueue) || a.name.localeCompare(b.name))
    .slice(0, 8);

  return {
    region,
    total: flat.length,
    online,
    queued,
    byStatus,
    byPopulation,
    topRealms,
  };
}

export { DEFAULT_REGION };
