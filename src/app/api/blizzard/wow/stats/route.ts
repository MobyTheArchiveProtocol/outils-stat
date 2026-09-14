import { NextResponse } from "next/server";

import { isBlizzardConfigured } from "@/lib/blizzard/oauth";
import { getWowRegionStats } from "@/lib/blizzard/stats";
import { parseRegion, REGIONS } from "@/lib/blizzard/regions";

export async function GET(request: Request) {
  if (!isBlizzardConfigured()) {
    return NextResponse.json(
      { error: "Battle.net credentials are not configured on the server." },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const region = parseRegion(url.searchParams.get("region"));

  try {
    const stats = await getWowRegionStats(region);
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { error: message, region, regions: REGIONS },
      { status: 502 }
    );
  }
}
