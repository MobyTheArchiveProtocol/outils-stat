export type Region = "us" | "eu" | "kr" | "tw";

export const REGIONS: Region[] = ["us", "eu", "kr", "tw"];

export const DEFAULT_REGION: Region = "eu";

export function isRegion(value: string | null | undefined): value is Region {
  return !!value && (REGIONS as string[]).includes(value);
}

export function parseRegion(value: string | null | undefined): Region {
  return isRegion(value) ? value : DEFAULT_REGION;
}

export const API_HOSTS: Record<Region, string> = {
  us: "us.api.blizzard.com",
  eu: "eu.api.blizzard.com",
  kr: "kr.api.blizzard.com",
  tw: "tw.api.blizzard.com",
};

export const OAUTH_HOSTS: Record<Region, string> = {
  us: "oauth.battle.net",
  eu: "oauth.battle.net",
  kr: "apac.battle.net",
  tw: "apac.battle.net",
};

export type Locale = "en_US" | "en_GB" | "fr_FR" | "de_DE" | "es_ES" | "ru_RU" | "ko_KR" | "zh_TW";

export const REGION_LOCALES: Record<Region, Locale> = {
  us: "en_US",
  eu: "en_GB",
  kr: "ko_KR",
  tw: "zh_TW",
};
