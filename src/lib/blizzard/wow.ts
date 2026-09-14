import "server-only";

import { blizzardGet, BlizzardApiError, namespaceFor } from "./client";
import { type Locale, type Region } from "./regions";
import type {
  CharacterAchievementsStatistics,
  CharacterAchievementsSummary,
  CharacterCollections,
  CharacterDetails,
  CharacterDungeons,
  CharacterEncounters,
  CharacterEquipmentSummary,
  CharacterMediaSummary,
  CharacterMountsCollection,
  CharacterPetsCollection,
  CharacterProfessions,
  CharacterProfile,
  CharacterProfileSummary,
  CharacterProgression,
  CharacterPvPBracket,
  CharacterPvPSummary,
  CharacterRaids,
  CharacterReputations,
  CharacterStatus,
  CharacterTitles,
  CharacterToysCollection,
  ConnectedRealm,
  ConnectedRealmsIndex,
  MythicKeystoneProfileIndex,
  MythicKeystoneSeasonDetails,
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
  return { hrefs: (data.connected_realms ?? []).map((r) => r.href) };
}

function pickLocal(field: { [locale: string]: string } | string | undefined, fallback: string): string {
  if (field === undefined || field === null) return fallback;
  if (typeof field === "string") return field;
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
    realms: (data.realms ?? []).map((r) => ({ name: pickLocal(r.name, r.slug), slug: r.slug })),
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
      ? (equipment.equipped_items ?? []).map((e) => ({
          slot: e.slot.type,
          slotName: pickLocal(e.slot.name, e.slot.type),
          name: e.name ? pickLocal(e.name, pickLocal(e.item.name, String(e.item.id))) : pickLocal(e.item.name, String(e.item.id)),
          level: e.level.value,
          quality: e.quality.type,
        }))
      : [],
  };
}

export async function getCharacterProgression(
  region: Region,
  realmInput: string,
  nameInput: string
): Promise<CharacterProgression> {
  const realm = normalizeRealm(realmInput);
  const name = normalizeName(nameInput);
  const empty: CharacterProgression = {
    achievements: null,
    statistics: null,
    mythicPlus: null,
  };
  if (!realm || !name) return empty;

  const ns = namespaceFor(region, "profile");
  const base = `/profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}`;

  const [achRes, statsRes, mplusRes] = await Promise.allSettled([
    blizzardGet<CharacterAchievementsSummary>({ region, namespace: ns, path: `${base}/achievements`, revalidate: 60 }),
    blizzardGet<CharacterAchievementsStatistics>({
      region,
      namespace: ns,
      path: `${base}/achievements/statistics`,
      revalidate: 60,
    }),
    blizzardGet<MythicKeystoneProfileIndex>({
      region,
      namespace: ns,
      path: `${base}/mythic-keystone-profile`,
      revalidate: 60,
    }),
  ]);

  const achievements =
    achRes.status === "fulfilled"
      ? {
          totalQuantity: achRes.value.total_quantity,
          totalPoints: achRes.value.total_points,
          recent: (achRes.value.achievements ?? [])
            .filter((a) => a.completed_timestamp || a.criteria?.is_completed)
            .sort((a, b) => (b.completed_timestamp ?? 0) - (a.completed_timestamp ?? 0))
            .slice(0, 12)
            .map((a) => ({
              name: pickLocal(a.achievement.name, String(a.achievement.id)),
              completedAt: a.completed_timestamp ?? null,
            })),
        }
      : null;

  const statistics =
    statsRes.status === "fulfilled"
      ? (statsRes.value.statistics ?? []).flatMap((cat) =>
          (cat.statistics ?? [])
            .filter((s) => s.quantity > 0)
            .map((s) => ({
              category: pickLocal(cat.name, String(cat.id)),
              name: pickLocal(s.name, String(s.id)),
              quantity: s.quantity,
            }))
        )
      : null;

  let mythicPlus: CharacterProgression["mythicPlus"] = null;
  if (mplusRes.status === "fulfilled") {
    const idx = mplusRes.value;
    const seasonId = idx.current_season?.id ?? null;
    if (seasonId !== null) {
      try {
        const season = await blizzardGet<MythicKeystoneSeasonDetails>({
          region,
          namespace: ns,
          path: `${base}/mythic-keystone-profile/season/${seasonId}`,
          revalidate: 60,
        });
        mythicPlus = {
          seasonId,
          bestRuns: (season.best_runs ?? []).map((r) => ({
            dungeonName: pickLocal(r.dungeon.name, String(r.dungeon.id)),
            keystoneLevel: r.keystone_level,
            duration: r.duration,
            completedWithinTime: r.is_completed_within_time,
            completedAt: r.completed_timestamp,
            affixes: (r.keystone_affixes ?? []).map((a) => pickLocal(a.name, String(a.id))),
            score: r.map_rating?.value ?? null,
          })),
        };
      } catch {
        mythicPlus = { seasonId, bestRuns: [] };
      }
    } else {
      mythicPlus = { seasonId: null, bestRuns: [] };
    }
  }

  return { achievements, statistics, mythicPlus };
}

const PVP_BRACKETS = ["2v2", "3v3", "rbg", "shuffle", "blitz"] as const;

type EncounterAgg = NonNullable<CharacterDetails["raids"]>["expansions"][number];

type EncounterInstanceAgg = EncounterAgg["instances"][number];

type EncounterModeAgg = EncounterInstanceAgg["modes"][number];

function mapEncounters(data: CharacterEncounters): NonNullable<CharacterDetails["raids"]> {
  return {
    expansions: (data.expansions ?? []).map((exp): EncounterAgg => ({
      name: pickLocal(exp.expansion.name, String(exp.expansion.id)),
      instances: (exp.instances ?? []).map((inst): EncounterInstanceAgg => ({
        name: pickLocal(inst.instance.name, String(inst.instance.id)),
        modes: (inst.modes ?? []).map((mode): EncounterModeAgg => ({
          difficulty: mode.difficulty.type,
          difficultyName: pickLocal(mode.difficulty.name, mode.difficulty.type),
          status: mode.status.type,
          statusName: pickLocal(mode.status.name, mode.status.type),
          completedCount: mode.progress.completed_count,
          totalCount: mode.progress.total_count,
        })),
      })),
    })),
  };
}

export async function getCharacterDetails(
  region: Region,
  realmInput: string,
  nameInput: string
): Promise<CharacterDetails> {
  const realm = normalizeRealm(realmInput);
  const name = normalizeName(nameInput);
  const empty: CharacterDetails = {
    collections: null,
    raids: null,
    dungeons: null,
    pvp: null,
    professions: null,
    reputations: null,
    titles: null,
  };
  if (!realm || !name) return empty;

  const ns = namespaceFor(region, "profile");
  const base = `/profile/wow/character/${encodeURIComponent(realm)}/${encodeURIComponent(name)}`;

  const [
    mountsRes,
    petsRes,
    toysRes,
    raidsRes,
    dungeonsRes,
    pvpSummaryRes,
    professionsRes,
    reputationsRes,
    titlesRes,
    bracket2v2Res,
    bracket3v3Res,
    bracketRbgRes,
    bracketShuffleRes,
    bracketBlitzRes,
  ] = await Promise.allSettled([
    blizzardGet<CharacterMountsCollection>({ region, namespace: ns, path: `${base}/collections/mounts`, revalidate: 60 }),
    blizzardGet<CharacterPetsCollection>({ region, namespace: ns, path: `${base}/collections/pets`, revalidate: 60 }),
    blizzardGet<CharacterToysCollection>({ region, namespace: ns, path: `${base}/collections/toys`, revalidate: 60 }),
    blizzardGet<CharacterRaids>({ region, namespace: ns, path: `${base}/encounters/raids`, revalidate: 60 }),
    blizzardGet<CharacterDungeons>({ region, namespace: ns, path: `${base}/encounters/dungeons`, revalidate: 60 }),
    blizzardGet<CharacterPvPSummary>({ region, namespace: ns, path: `${base}/pvp-summary`, revalidate: 60 }),
    blizzardGet<CharacterProfessions>({ region, namespace: ns, path: `${base}/professions`, revalidate: 60 }),
    blizzardGet<CharacterReputations>({ region, namespace: ns, path: `${base}/reputations`, revalidate: 60 }),
    blizzardGet<CharacterTitles>({ region, namespace: ns, path: `${base}/titles`, revalidate: 60 }),
    blizzardGet<CharacterPvPBracket>({ region, namespace: ns, path: `${base}/pvp-bracket/2v2`, revalidate: 60 }),
    blizzardGet<CharacterPvPBracket>({ region, namespace: ns, path: `${base}/pvp-bracket/3v3`, revalidate: 60 }),
    blizzardGet<CharacterPvPBracket>({ region, namespace: ns, path: `${base}/pvp-bracket/rbg`, revalidate: 60 }),
    blizzardGet<CharacterPvPBracket>({ region, namespace: ns, path: `${base}/pvp-bracket/shuffle`, revalidate: 60 }),
    blizzardGet<CharacterPvPBracket>({ region, namespace: ns, path: `${base}/pvp-bracket/blitz`, revalidate: 60 }),
  ]);

  let collections: CharacterCollections | null = null;
  if (mountsRes.status === "fulfilled" || petsRes.status === "fulfilled" || toysRes.status === "fulfilled") {
    collections = {
      mounts:
        mountsRes.status === "fulfilled"
          ? (mountsRes.value.mounts ?? []).map((m) => ({
              name: pickLocal(m.mount.name, String(m.mount.id)),
              id: m.mount.id,
              isFavorite: m.is_favorite ?? false,
            }))
          : null,
      pets:
        petsRes.status === "fulfilled"
          ? (petsRes.value.pets ?? []).map((p) => ({
              name: pickLocal(p.species.name, String(p.species.id)),
              id: p.species.id,
              level: p.level,
              quality: p.quality.type,
              qualityName: pickLocal(p.quality.name, p.quality.type),
              health: p.stats.health,
              power: p.stats.power,
              speed: p.stats.speed,
            }))
          : null,
      toys:
        toysRes.status === "fulfilled"
          ? (toysRes.value.toys ?? []).map((t) => ({ name: pickLocal(t.toy.name, String(t.toy.id)), id: t.toy.id }))
          : null,
      needsAuth: false,
    };
  } else {
    collections = { mounts: null, pets: null, toys: null, needsAuth: true };
  }

  const raids = raidsRes.status === "fulfilled" ? mapEncounters(raidsRes.value) : null;
  const dungeons = dungeonsRes.status === "fulfilled" ? mapEncounters(dungeonsRes.value) : null;

  let pvp: CharacterDetails["pvp"] = null;
  if (pvpSummaryRes.status === "fulfilled") {
    const summary = pvpSummaryRes.value;
    const bracketResults = [
      bracket2v2Res,
      bracket3v3Res,
      bracketRbgRes,
      bracketShuffleRes,
      bracketBlitzRes,
    ];
    const brackets = bracketResults
      .map((res, i) =>
        res.status === "fulfilled" && res.value.rating > 0
          ? {
              bracket: PVP_BRACKETS[i],
              rating: res.value.rating,
              seasonId: res.value.season.id,
              seasonPlayed: res.value.season_match_statistics.played,
              seasonWon: res.value.season_match_statistics.won,
              seasonLost: res.value.season_match_statistics.lost,
              weeklyPlayed: res.value.weekly_match_statistics.played,
              weeklyWon: res.value.weekly_match_statistics.won,
              weeklyLost: res.value.weekly_match_statistics.lost,
            }
          : null
      )
      .filter((b): b is NonNullable<typeof b> => b !== null);
    pvp = {
      honorableKills: summary.honorable_kills,
      honorLevel: summary.honor_level,
      mapStatistics: (summary.pvp_map_statistics ?? []).map((s) => ({
        mapName: pickLocal(s.world_map.name, String(s.world_map.id)),
        played: s.match_statistics.played,
        won: s.match_statistics.won,
        lost: s.match_statistics.lost,
      })),
      brackets,
    };
  }

  const professions: CharacterDetails["professions"] = professionsRes.status === "fulfilled"
    ? {
        primaries: (professionsRes.value.primaries ?? []).map((p) => ({
          name: pickLocal(p.profession.name, String(p.profession.id)),
          tiers: (p.tiers ?? []).map((t) => ({
            tierName: pickLocal(t.tier.name, String(t.tier.id)),
            skillPoints: t.skill_points,
            maxSkillPoints: t.max_skill_points,
            recipeCount: (t.known_recipes ?? []).length,
          })),
        })),
        secondaries: (professionsRes.value.secondaries ?? []).map((p) => ({
          name: pickLocal(p.profession.name, String(p.profession.id)),
          tiers: (p.tiers ?? []).map((t) => ({
            tierName: pickLocal(t.tier.name, String(t.tier.id)),
            skillPoints: t.skill_points,
            maxSkillPoints: t.max_skill_points,
            recipeCount: (t.known_recipes ?? []).length,
          })),
        })),
      }
    : null;

  const reputations: CharacterDetails["reputations"] = reputationsRes.status === "fulfilled"
    ? (reputationsRes.value.reputations ?? []).map((r) => ({
        faction: pickLocal(r.faction.name, String(r.faction.id)),
        tier: r.standing.tier,
        standingName: pickLocal(r.standing.name, String(r.standing.tier)),
        value: r.standing.value,
        max: r.standing.max,
      }))
    : null;

  const titles: CharacterDetails["titles"] = titlesRes.status === "fulfilled"
    ? {
        active: titlesRes.value.active_title ? pickLocal(titlesRes.value.active_title.display_string, pickLocal(titlesRes.value.active_title.name, "")) : null,
        list: (titlesRes.value.titles ?? []).map((t) => pickLocal(t.name, String(t.id))),
      }
    : null;

  return { collections, raids, dungeons, pvp, professions, reputations, titles };
}
