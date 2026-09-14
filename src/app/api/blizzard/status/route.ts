import { NextResponse } from "next/server";

import { isBlizzardConfigured } from "@/lib/blizzard/oauth";
import { DEFAULT_REGION, REGIONS } from "@/lib/blizzard/regions";

export async function GET() {
  return NextResponse.json({
    configured: isBlizzardConfigured(),
    defaultRegion: DEFAULT_REGION,
    regions: REGIONS,
    games: ["wow"],
  });
}
