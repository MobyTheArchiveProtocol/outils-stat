import type { Region } from "./regions";

export type SelfRef = {
  href: string;
};

export type LocalizedField = {
  [locale: string]: string;
};

export type Realm = {
  id: number;
  name: LocalizedField;
  slug: string;
  region: { name: LocalizedField; slug: string; id: number };
  timezone: string;
  category: LocalizedField | null;
  type: { type: string; name: LocalizedField };
  is_tournament: boolean;
  has_queue: boolean;
  status: { type: string; name: LocalizedField };
  population: { type: string; name: LocalizedField };
};

export type RealmsIndex = {
  realms: { href: string; name: LocalizedField; id: number; slug: string }[];
};

export type RealmStatus = {
  id: number;
  connected_realm: SelfRef;
  has_queue: boolean;
  status: { type: string; name: LocalizedField };
  population: { type: string; name: LocalizedField };
  realm: {
    id: number;
    name: LocalizedField;
    slug: string;
  };
};

export type ConnectedRealm = {
  id: number;
  has_queue: boolean;
  status: { type: string; name: LocalizedField };
  population: { type: string; name: LocalizedField };
  realms: Realm[];
};

export type ConnectedRealmsIndex = {
  connected_realms: SelfRef[];
};

export type Game = "wow";

export const GAMES: Game[] = ["wow"];

export type RegionStat = {
  region: Region;
  total: number;
  online: number;
  queued: number;
  byStatus: Record<string, number>;
  byPopulation: Record<string, number>;
  topRealms: { name: string; slug: string; status: string; population: string; hasQueue: boolean }[];
};

type TypeRef = { type: string; name: LocalizedField };

type CharacterRef = {
  name: LocalizedField;
  slug?: string;
  realm?: { name: LocalizedField; slug: string; id: number; key?: SelfRef };
};

type EquippedItem = {
  item: { id: number; name: LocalizedField };
  slot: { type: string; name: LocalizedField };
  level: { value: number };
  quality: { type: string; name: LocalizedField };
  name?: LocalizedField;
};

type CharacterMedia = {
  avatar_url?: string;
  bust_url?: string;
  render_url?: string;
  character: CharacterRef;
};

export type CharacterProfileSummary = {
  id: number;
  name: LocalizedField;
  level: number;
  achievement_points: number;
  gender: TypeRef;
  faction: TypeRef;
  race: { name: LocalizedField };
  character_class: { id: number; name: LocalizedField };
  active_spec: { name: LocalizedField };
  realm: { id: number; name: LocalizedField; slug: string };
  guild?: { name: LocalizedField };
  average_item_level: number;
  equipped_item_level: number;
  pvp_summary?: { honor_level: number; pvp_map: LocalizedField };
};

export type CharacterStatus = {
  is_valid: boolean;
  id: number;
};

export type CharacterEquipmentSummary = {
  character: CharacterRef;
  equipped_items: EquippedItem[];
};

export type CharacterMediaSummary = CharacterMedia;

export type CharacterProfile = {
  region: Region;
  name: string;
  realmSlug: string;
  realmName: string;
  level: number;
  achievementPoints: number;
  averageItemLevel: number;
  equippedItemLevel: number;
  className: string;
  specName: string;
  raceName: string;
  genderName: string;
  factionName: string;
  guildName: string | null;
  isValid: boolean;
  avatarUrl: string | null;
  renderUrl: string | null;
  equipment: {
    slot: string;
    slotName: string;
    name: string;
    level: number;
    quality: string;
  }[];
};

type AchievementItem = {
  id: number;
  achievement: { name: LocalizedField; id: number };
  criteria?: { is_completed: boolean };
  completed_timestamp?: number;
};

export type CharacterAchievementsSummary = {
  total_quantity: number;
  total_points: number;
  achievements: AchievementItem[];
};

export type CharacterAchievementsStatistics = {
  character: CharacterRef;
  statistics: {
    id: number;
    name: LocalizedField;
    statistics: { id: number; name: LocalizedField; quantity: number }[];
  }[];
};

type KeystoneAffix = { id: number; name: LocalizedField; icon: string };

type KeystoneRun = {
  completed_timestamp: number;
  duration: number;
  keystone_level: number;
  is_completed_within_time: boolean;
  dungeon: { id: number; name: LocalizedField; icon?: string };
  keystone_affixes: KeystoneAffix[];
  map_rating?: { value: number };
};

export type MythicKeystoneProfileIndex = {
  current_season: { id: number; key?: SelfRef } | null;
  seasons: SelfRef[];
};

export type MythicKeystoneSeasonDetails = {
  season: { id: number };
  best_runs: KeystoneRun[];
};

export type CharacterProgression = {
  achievements: {
    totalQuantity: number;
    totalPoints: number;
    recent: { name: string; completedAt: number | null }[];
  } | null;
  statistics: { category: string; name: string; quantity: number }[] | null;
  mythicPlus: {
    seasonId: number | null;
    bestRuns: {
      dungeonName: string;
      keystoneLevel: number;
      duration: number;
      completedWithinTime: boolean;
      completedAt: number;
      affixes: string[];
      score: number | null;
    }[];
  } | null;
};
