"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

import { DEFAULT_REGION, REGIONS, type Region } from "@/lib/blizzard/regions";
import type { CharacterProfile, CharacterProgression } from "@/lib/blizzard/types";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; notFound?: boolean }
  | { status: "success"; data: CharacterProfile; progression: CharacterProgression | null };

const QUALITY_COLORS: Record<string, string> = {
  POOR: "#9d9d9d",
  COMMON: "#ffffff",
  UNCOMMON: "#1eff00",
  RARE: "#0070dd",
  EPIC: "#a335ee",
  LEGENDARY: "#ff8000",
  ARTIFACT: "#e6cc80",
  HEIRLOOM: "#00ccff",
};

export default function CharacterSearch() {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [realm, setRealm] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const load = useCallback(async () => {
    if (!realm.trim() || !name.trim()) {
      setState({ status: "error", message: "Renseignez un royaume et un nom de personnage." });
      return;
    }
    setState({ status: "loading" });
    const params = new URLSearchParams({
      region,
      realm: realm.trim(),
      name: name.trim(),
    });
    try {
      const res = await fetch(`/api/blizzard/wow/character?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (res.status === 404) {
        setState({ status: "error", message: json?.error ?? "Personnage introuvable.", notFound: true });
        return;
      }
      if (!res.ok) {
        setState({ status: "error", message: json?.error ?? `Erreur ${res.status}` });
        return;
      }
      const data = json as CharacterProfile;
      setState({ status: "success", data, progression: null });

      try {
        const progRes = await fetch(`/api/blizzard/wow/character/progression?${params.toString()}`, {
          cache: "no-store",
        });
        if (progRes.ok) {
          const progJson = await progRes.json();
          setState({ status: "success", data, progression: progJson as CharacterProgression });
        }
      } catch {
        // progression stays null — already displayed profile
      }
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : "Erreur réseau" });
    }
  }, [region, realm, name]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Personnage WoW</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Recherchez un personnage par royaume et nom · source Battle.net Profile API
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="region" className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            région
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 font-mono text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="realm" className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            royaume (slug)
          </label>
          <input
            id="realm"
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder="ex : hyjal, draenor, tarren-mill"
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            nom
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex : varian"
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="h-10 rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state.status === "loading" ? "..." : "Chercher"}
        </button>
      </form>

      {state.status === "loading" && (
        <div className="h-64 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
      )}

      {state.status === "error" && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="font-mono text-sm text-red-300">
            {state.notFound ? "Personnage introuvable." : "Impossible de charger le personnage."}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{state.message}</p>
          {state.notFound && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Vérifiez le slug du royaume et le nom, ou la région sélectionnée.
            </p>
          )}
        </div>
      )}

      {state.status === "success" && (
        <ProfileView data={state.data} progression={state.progression} />
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-2.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium tabular-nums">{value ?? "—"}</span>
    </div>
  );
}

function ProfileView({
  data,
  progression,
}: {
  data: CharacterProfile;
  progression: CharacterProgression | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:flex-row">
        {data.avatarUrl && (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-black/30">
            <Image src={data.avatarUrl} alt={data.name} fill sizes="96px" className="object-cover" unoptimized />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {data.name}
            {!data.isValid && (
              <span className="ml-2 font-mono text-xs uppercase tracking-widest text-amber-300">
                invalide
              </span>
            )}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {data.raceName} {data.className} {data.specName && `· ${data.specName}`} · Niv. {data.level}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {data.realmName} <span className="text-[var(--muted)]">({data.realmSlug})</span> · région{" "}
            {data.region.toUpperCase()} {data.factionName && `· ${data.factionName}`}
          </p>
          {data.guildName && (
            <p className="text-sm text-[var(--accent)]">⟨ {data.guildName} ⟩</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Aperçu
          </h3>
          <StatRow label="Niveau" value={data.level} />
          <StatRow label="Points de hauts faits" value={data.achievementPoints.toLocaleString("fr-FR")} />
          <StatRow label="iLvl moyen" value={data.averageItemLevel} />
          <StatRow label="iLvl équipé" value={data.equippedItemLevel} />
          <StatRow label="Classe" value={data.className} />
          <StatRow label="Spécialisation" value={data.specName || "—"} />
          <StatRow label="Race" value={data.raceName || "—"} />
          <StatRow label="Faction" value={data.factionName || "—"} />
          <StatRow label="Guilde" value={data.guildName ?? "—"} />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Équipement
          </h3>
          {data.equipment.length === 0 ? (
            <p className="py-4 text-sm text-[var(--muted)]">Aucun équipement renvoyé.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {data.equipment.map((item) => (
                <li key={item.slot} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-24 text-[var(--muted)]">{item.slotName}</span>
                    <span style={{ color: QUALITY_COLORS[item.quality] ?? "var(--foreground)" }}>
                      {item.name}
                    </span>
                  </span>
                  <span className="tabular-nums text-[var(--muted)]">{item.level}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {progression === null ? (
        <ProgressionSkeleton />
      ) : (
        <ProgressionSections progression={progression} />
      )}
    </div>
  );
}

function ProgressionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-32 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ProgressionSections({ progression }: { progression: CharacterProgression }) {
  return (
    <div className="flex flex-col gap-6">
      {progression.achievements && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Hauts faits
            </h3>
            <span className="font-mono text-sm tabular-nums text-[var(--accent)]">
              {progression.achievements.totalPoints.toLocaleString("fr-FR")} pts ·{" "}
              {progression.achievements.totalQuantity} complétés
            </span>
          </div>
          {progression.achievements.recent.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Aucun haut fait récent.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {progression.achievements.recent.map((a, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span>{a.name}</span>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {a.completedAt ? new Date(a.completedAt).toLocaleDateString("fr-FR") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {progression.mythicPlus && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Mythic+ · saison {progression.mythicPlus.seasonId ?? "?"}
          </h3>
          {progression.mythicPlus.bestRuns.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Aucune clé enregistrée pour cette saison.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {progression.mythicPlus.bestRuns.map((run, i) => (
                <li key={i} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{run.dungeonName}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono tabular-nums text-[var(--accent)]">
                        +{run.keystoneLevel}
                      </span>
                      {run.completedWithinTime ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
                          dans le temps
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
                          hors temps
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span className="tabular-nums">{formatDuration(run.duration)}</span>
                    <span>{new Date(run.completedAt).toLocaleDateString("fr-FR")}</span>
                    {run.affixes.length > 0 && (
                      <span className="text-[var(--muted)]">· {run.affixes.join(", ")}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {progression.statistics && progression.statistics.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Statistiques notables
          </h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {progression.statistics
              .slice()
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 24)
              .map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2 text-[var(--muted)]">{s.name}</span>
                  <span className="font-mono tabular-nums">{s.quantity.toLocaleString("fr-FR")}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
