import "server-only";

import { blizzardGet, BlizzardApiError, namespaceFor } from "./client";
import { type Locale, type Region } from "./regions";
import type {
  CharacterEquipmentSummary,
  CharacterMediaSummary,
  CharacterProfile,
  CharacterProfileSummary,
  CharacterStatus,
  ConnectedRealm,
  ConnectedRealmsIndex,
} from "./types";

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

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function normalizeRealm(realm: string): string {
  return realm
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/^-+|-+$/g, "");
}

export async function getCharacterProfile(
  region: Region,
  realmInput: string,
  nameInput: string
): Promise<CharacterProfile | null> {
  const realm = normalizeRealm(realmInput);
  const name = normalizeName(nameInput);
  if (!realm || !name) return null;

  const ns = namespaceFor(region, "profile");
  const base = `/profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}`;

  const [summaryRes, statusRes, equipmentRes, mediaRes] = await Promise.allSettled([
    blizzardGet<CharacterProfileSummary>({
      region,
      namespace: ns,
      path: base,
      revalidate: 60,
    }),
    blizzardGet<CharacterStatus>({ region, namespace: ns, path: `${base}/status`, revalidate: 60 }),
    blizzardGet<CharacterEquipmentSummary>({
      region,
      namespace: ns,
      path: `${base}/equipment`,
      revalidate: 60,
    }),
    blizzardGet<CharacterMediaSummary>({
      region,
      namespace: ns,
      path: `${base}/character-media`,
      revalidate: 60,
    }),
  ]);

  if (summaryRes.status === "rejected") {
    const err = summaryRes.reason;
    if (err instanceof BlizzardApiError && err.status === 404) return null;
    throw err;
  }

  const summary = summaryRes.value;
  const status = statusRes.status === "fulfilled" ? statusRes.value : undefined;
  const equipment = equipmentRes.status === "fulfilled" ? equipmentRes.value : undefined;
  const media = mediaRes.status === "fulfilled" ? mediaRes.value : undefined;

  return {
    region,
    name: pickLocal(summary.name, name),
    realmSlug: summary.realm.slug,
    realmName: pickLocal(summary.realm.name, summary.realm.slug),
    level: summary.level,
    achievementPoints: summary.achievement_points,
    averageItemLevel: summary.average_item_level,
    equippedItemLevel: summary.equipped_item_level,
    className: pickLocal(summary.character_class.name, String(summary.character_class.id)),
    specName: summary.active_spec ? pickLocal(summary.active_spec.name, "") : "",
    raceName: summary.race ? pickLocal(summary.race.name, "") : "",
    genderName: summary.gender ? pickLocal(summary.gender.name, summary.gender.type) : "",
    factionName: summary.faction ? pickLocal(summary.faction.name, summary.faction.type) : "",
    guildName: summary.guild ? pickLocal(summary.guild.name, "") : null,
    isValid: status ? status.is_valid : true,
    avatarUrl: media?.avatar_url ?? null,
    renderUrl: media?.render_url ?? null,
    equipment: equipment
      ? equipment.equipped_items.map((e) => ({
          slot: e.slot.type,
          slotName: pickLocal(e.slot.name, e.slot.type),
          name: e.name ? pickLocal(e.name, pickLocal(e.item.name, String(e.item.id))) : pickLocal(e.item.name, String(e.item.id)),
          level: e.level.value,
          quality: e.quality.type,
        }))
      : [],
  };
}
