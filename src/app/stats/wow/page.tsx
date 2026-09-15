import type { Metadata } from "next";

import { DEFAULT_REGION } from "@/lib/blizzard/regions";
import WowStatsClient from "./WowStatsClient";

export const metadata: Metadata = {
  title: "Stats World of Warcraft",
  description: "Statut des royaumes connectés WoW par région, files d'attente et population.",
};

export default function WowStatsPage() {
  return <WowStatsClient initialRegion={DEFAULT_REGION} />;
}
