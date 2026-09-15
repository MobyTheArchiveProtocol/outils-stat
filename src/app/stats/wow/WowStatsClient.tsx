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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="kicker">World of Warcraft</span>
          <h1 className="mt-2 text-2xl font-semibold uppercase tracking-tight text-[var(--text)] sm:text-3xl">
            Royaumes connectés
          </h1>
          <p className="mt-1 text-sm muted">Statut des royaumes · source Battle.net API</p>
          <Link
            href="/stats/wow/character"
            className="mt-2 inline-block text-sm text-[var(--gold)] hover:text-[var(--gold-bright)]"
          >
            rechercher un personnage →
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="region" className="kicker">
            région
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="field"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleRefresh} className="btn-ghost h-10 px-3 text-xs">
            rafraîchir
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
        <div key={i} className="h-24 animate-pulse panel" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="panel border-l-2 border-l-[var(--danger)] p-5">
      <p className="text-sm text-[var(--danger)]">Impossible de charger les stats.</p>
      <p className="mt-2 text-sm text-[var(--text-soft)]">{message}</p>
      <p className="mt-3 text-xs muted">
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
    <div className="panel p-4">
      <p className="kicker">{label}</p>
      <p className="num mt-2 text-2xl text-[var(--text)]">{value}</p>
      {hint && <p className="mt-1 text-xs muted">{hint}</p>}
    </div>
  );
}

function StatsView({ data }: { data: RegionStat }) {
  const statusEntries = Object.entries(data.byStatus).sort((a, b) => b[1] - a[1]);
  const popEntries = Object.entries(data.byPopulation).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v), 1);
  const maxPop = Math.max(...popEntries.map(([, v]) => v), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Royaumes" value={data.total} hint={`région ${data.region.toUpperCase()}`} />
        <StatCard label="En ligne" value={data.online} />
        <StatCard label="Avec file" value={data.queued} />
        <StatCard
          label="Disponibilité"
          value={data.total > 0 ? `${Math.round((data.online / data.total) * 100)}%` : "—"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel">
          <div className="panel-head">
            <h2 className="section-title">Par statut</h2>
          </div>
          <div className="p-4">
            <ul className="flex flex-col gap-3">
              {statusEntries.map(([key, value]) => (
                <li key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-[var(--text-soft)]">{STATUS_LABELS[key] ?? key}</span>
                    <span className="num text-[var(--muted)]">{value}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(value / maxStatus) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="section-title">Par population</h2>
          </div>
          <div className="p-4">
            <ul className="flex flex-col gap-3">
              {popEntries.map(([key, value]) => (
                <li key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-[var(--text-soft)]">{POP_LABELS[key] ?? key}</span>
                    <span className="num text-[var(--muted)]">{value}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(value / maxPop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2 className="section-title">Royaumes d’attention</h2>
        </div>
        <div className="p-0">
          {data.topRealms.length === 0 ? (
            <p className="p-4 text-sm muted">Aucun royaume à signaler.</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Royaume</th>
                  <th>Population</th>
                  <th className="right">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.topRealms.map((r) => (
                  <tr key={r.slug}>
                    <td className="text-[var(--text)]">{r.name}</td>
                    <td className="muted">{POP_LABELS[r.population] ?? r.population}</td>
                    <td className="right">
                      <span className={r.status === "UP" ? "text-[var(--rune)]" : "text-[var(--danger)]"}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                      {r.hasQueue && (
                        <span className="ml-2 text-xs text-[var(--warn)]">file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
