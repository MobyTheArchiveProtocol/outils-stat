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
  bustUrl: string | null;
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

type NamedRef = { name: LocalizedField | string; id: number; key?: SelfRef };

type TypeNamedRef = { type: string; name: LocalizedField | string };

type EncounterProgress = {
  completed_count: number;
  total_count: number;
  encounters: {
    encounter: NamedRef;
    completed_count: number;
    last_kill_timestamp: number;
  }[];
};

type EncounterMode = {
  difficulty: TypeNamedRef;
  status: TypeNamedRef;
  progress: EncounterProgress;
};

type EncounterExpansion = {
  expansion: NamedRef;
  instances: {
    instance: NamedRef;
    modes: EncounterMode[];
  }[];
};

export type CharacterEncounters = {
  expansions: EncounterExpansion[];
};

export type CharacterRaids = CharacterEncounters;

export type CharacterDungeons = CharacterEncounters;

export type CharacterCollectionsIndex = {
  mounts: SelfRef;
  pets: SelfRef;
  toys?: SelfRef;
  heirlooms?: SelfRef;
};

export type CharacterMountsCollection = {
  mounts: { mount: NamedRef; is_favorite?: boolean }[];
};

export type CharacterPetsCollection = {
  pets: {
    species: NamedRef;
    level: number;
    quality: TypeNamedRef;
    stats: { breed_id: number; health: number; power: number; speed: number };
    is_favorite?: boolean;
  }[];
  unlocked_battle_pet_slots: number;
};

export type CharacterToysCollection = {
  toys: { toy: NamedRef }[];
};

export type CharacterPvPSummary = {
  honorable_kills: number;
  honor_level: number;
  brackets: { href: string }[];
  pvp_map_statistics: {
    world_map: { name: LocalizedField | string; id: number };
    match_statistics: { played: number; won: number; lost: number };
  }[];
};

type MatchStatistics = { played: number; won: number; lost: number };

export type CharacterPvPBracket = {
  rating: number;
  season: { id: number };
  tier: { id: number } | null;
  season_match_statistics: MatchStatistics;
  weekly_match_statistics: MatchStatistics;
  bracket: { id: number; type: string };
};

type ProfessionTier = {
  skill_points: number;
  max_skill_points: number;
  tier: { name: LocalizedField | string; id: number };
  known_recipes: NamedRef[];
};

export type CharacterProfessions = {
  primaries: { profession: NamedRef; tiers: ProfessionTier[] }[];
  secondaries: { profession: NamedRef; tiers: ProfessionTier[] }[];
};

export type CharacterReputations = {
  reputations: {
    faction: NamedRef;
    standing: {
      raw: number;
      value: number;
      max: number;
      tier: number;
      name: LocalizedField | string;
      renown_level?: number;
    };
    paragon?: { raw: number; value: number; max: number };
  }[];
};

export type CharacterTitles = {
  active_title?: { name: LocalizedField | string; id: number; display_string: LocalizedField | string } | null;
  titles: NamedRef[];
};

export type CharacterCollections = {
  mounts: { name: string; id: number; isFavorite: boolean }[] | null;
  pets: {
    name: string;
    id: number;
    level: number;
    quality: string;
    qualityName: string;
    health: number;
    power: number;
    speed: number;
  }[] | null;
  toys: { name: string; id: number }[] | null;
  needsAuth: boolean;
};

export type CharacterDetails = {
  collections: CharacterCollections | null;
  raids: {
    expansions: {
      name: string;
      instances: {
        name: string;
        modes: {
          difficulty: string;
          difficultyName: string;
          status: string;
          statusName: string;
          completedCount: number;
          totalCount: number;
        }[];
      }[];
    }[];
  } | null;
  dungeons: {
    expansions: {
      name: string;
      instances: {
        name: string;
        modes: {
          difficulty: string;
          difficultyName: string;
          status: string;
          statusName: string;
          completedCount: number;
          totalCount: number;
        }[];
      }[];
    }[];
  } | null;
  pvp: {
    honorableKills: number;
    honorLevel: number;
    mapStatistics: { mapName: string; played: number; won: number; lost: number }[];
    brackets: {
      bracket: string;
      rating: number;
      seasonId: number;
      seasonPlayed: number;
      seasonWon: number;
      seasonLost: number;
      weeklyPlayed: number;
      weeklyWon: number;
      weeklyLost: number;
    }[];
  } | null;
  professions: {
    primaries: { name: string; tiers: { tierName: string; skillPoints: number; maxSkillPoints: number; recipeCount: number }[] }[];
    secondaries: { name: string; tiers: { tierName: string; skillPoints: number; maxSkillPoints: number; recipeCount: number }[] }[];
  } | null;
  reputations: {
    faction: string;
    tier: number;
    standingName: string;
    value: number;
    max: number;
  }[] | null;
  titles: {
    active: string | null;
    list: string[];
  } | null;
};
