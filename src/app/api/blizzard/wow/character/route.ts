import { NextResponse } from "next/server";

import { isBlizzardConfigured } from "@/lib/blizzard/oauth";
import { parseRegion, REGIONS } from "@/lib/blizzard/regions";
import { getCharacterProfile } from "@/lib/blizzard/wow";

export async function GET(request: Request) {
  if (!isBlizzardConfigured()) {
    return NextResponse.json(
      { error: "Battle.net credentials are not configured on the server." },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const region = parseRegion(url.searchParams.get("region"));
  const realm = url.searchParams.get("realm") ?? "";
  const name = url.searchParams.get("name") ?? "";

  if (!realm.trim() || !name.trim()) {
    return NextResponse.json(
      { error: "Paramètres manquants : 'realm' et 'name' sont requis.", region, regions: REGIONS },
      { status: 400 }
    );
  }

  try {
    const profile = await getCharacterProfile(region, realm, name);
    if (!profile) {
      return NextResponse.json(
        { error: "Personnage introuvable.", region, realm, name },
        { status: 404 }
      );
    }
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      { error: message, region, regions: REGIONS },
      { status: 502 }
    );
  }
}
