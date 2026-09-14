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
