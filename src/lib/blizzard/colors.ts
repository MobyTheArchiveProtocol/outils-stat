// Canonical Blizzard coloring for classes, factions, and item quality.
// Values sourced from RAID_CLASS_COLORS / ITEM_QUALITY_COLORS.

export const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "#c41f3b",
  "Demon Hunter": "#a330c9",
  Druid: "#ff7d0a",
  Evoker: "#33937f",
  Hunter: "#abd473",
  Mage: "#69ccf0",
  Monk: "#00ff96",
  Paladin: "#f58cba",
  Priest: "#f0ebe0",
  Rogue: "#fff569",
  Shaman: "#0070de",
  Warlock: "#9482c9",
  Warrior: "#c79c6e",
};

export const QUALITY_COLORS: Record<string, string> = {
  POOR: "#9d9d9d",
  COMMON: "#ffffff",
  UNCOMMON: "#1eff00",
  RARE: "#0070dd",
  EPIC: "#a335ee",
  LEGENDARY: "#ff8000",
  ARTIFACT: "#e6cc80",
  HEIRLOOM: "#00ccff",
};

export function classColor(className: string): string | undefined {
  return CLASS_COLORS[className];
}

export function factionColor(factionName: string): string | undefined {
  const f = factionName.toLowerCase();
  if (f === "horde") return "#c33";
  if (f === "alliance") return "#2b6cf0";
  return undefined;
}

export function qualityColor(quality: string): string {
  return QUALITY_COLORS[quality] ?? "#e8e2d0";
}
