import type { Metadata } from "next";

import { DEFAULT_REGION } from "@/lib/blizzard/regions";
import WowStatsClient from "./WowStatsClient";

export const metadata: Metadata = {
  title: "Stats World of Warcraft",
  description: "Statut des royaumes connectés WoW par région, files d'attente et population.",
};

export default function WowStatsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <WowStatsClient initialRegion={DEFAULT_REGION} />
    </div>
  );
}
