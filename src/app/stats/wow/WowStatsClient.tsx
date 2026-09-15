"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { REGIONS, type Region } from "@/lib/blizzard/regions";
import type { RegionStat } from "@/lib/blizzard/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: RegionStat };

export default function WowStatsClient({ initialRegion }: { initialRegion: Region }) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const [state, setState] = useState<State>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blizzard/wow/stats?region=${region}`, { cache: "no-store" })
      .then((res) => res.json().then((json) => ({ res, json })))
      .then(({ res, json }) => {
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "error", message: json?.error ?? `Erreur ${res.status}` });
          return;
        }
        setState({ status: "success", data: json as RegionStat });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Erreur réseau",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [region, reloadKey]);

  const handleRefresh = () => {
    setState({ status: "loading" });
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">❄ Norfendre</span>
          <h1 className="mt-2 text-3xl font-semibold uppercase tracking-tight text-[var(--foreground-frost)]">World of Warcraft</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Statut des royaumes connectés · source Battle.net API
          </p>
          <Link
            href="/stats/wow/character"
            className="mt-2 inline-block font-mono text-xs text-[var(--accent)] underline-offset-4 hover:underline"
          >
            rechercher un personnage →
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="region" className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            région
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="frost-input font-mono"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            className="h-10 rounded-lg border border-[var(--border)] px-3 font-mono text-xs uppercase tracking-widest text-[var(--muted)] transition-colors hover:border-[var(--border-frost)] hover:text-[var(--foreground)]"
          >
            refresh
          </button>
        </div>
      </div>

      {state.status === "loading" && <LoadingState />}
      {state.status === "error" && <ErrorState message={state.message} />}
      {state.status === "success" && <StatsView data={state.data} />}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse frost-card" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
      <p className="font-mono text-sm text-red-300">Impossible de charger les stats.</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Vérifiez que les credentials Blizzard sont configurés côté serveur.
      </p>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  UP: "En ligne",
  DOWN: "Hors ligne",
};

const POP_LABELS: Record<string, string> = {
  FULL: "Plein",
  HIGH: "Élevée",
  MEDIUM: "Moyenne",
  LOW: "Faible",
  LOWEST: "Très faible",
};

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="frost-card p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

function StatsView({ data }: { data: RegionStat }) {
  const statusEntries = Object.entries(data.byStatus).sort((a, b) => b[1] - a[1]);
  const popEntries = Object.entries(data.byPopulation).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v), 1);
  const maxPop = Math.max(...popEntries.map(([, v]) => v), 1);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Royaumes" value={data.total} hint={`région ${data.region.toUpperCase()}`} />
        <StatCard label="En ligne" value={data.online} />
        <StatCard label="Avec file" value={data.queued} />
        <StatCard
          label="Disponibilité"
          value={data.total > 0 ? `${Math.round((data.online / data.total) * 100)}%` : "—"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="frost-card p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Par statut
          </h2>
          <ul className="flex flex-col gap-3">
            {statusEntries.map(([key, value]) => (
              <li key={key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{STATUS_LABELS[key] ?? key}</span>
                  <span className="tabular-nums text-[var(--muted)]">{value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${(value / maxStatus) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="frost-card p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Par population
          </h2>
          <ul className="flex flex-col gap-3">
            {popEntries.map(([key, value]) => (
              <li key={key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{POP_LABELS[key] ?? key}</span>
                  <span className="tabular-nums text-[var(--muted)]">{value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-deep)] to-[var(--accent)]"
                    style={{ width: `${(value / maxPop) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="frost-card p-6">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Royaumes d’attention
        </h2>
        {data.topRealms.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Aucun royaume à signaler.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {data.topRealms.map((r) => (
              <li key={r.slug} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="flex items-center gap-3 text-[var(--muted)]">
                  <span>{POP_LABELS[r.population] ?? r.population}</span>
                  <span
                    className={
                      r.status === "UP"
                        ? "text-[var(--accent)]"
                        : "text-red-400"
                    }
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                  {r.hasQueue && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
                      file
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
