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
    <article className="manuscript ornament-corners gilt-frame">
      <header className="flex flex-col gap-3 border-b border-dotted border-[var(--ink-mute)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="chap-label">⚔ Chapitre I</p>
          <h1 className="h-chronicle mt-2 text-3xl uppercase sm:text-4xl">Royaumes connectés</h1>
          <p className="mt-1 text-sm italic text-[var(--ink-faded)]">
            Statut des royaumes World of Warcraft · source Battle.net API
          </p>
          <Link
            href="/stats/wow/character"
            className="mt-3 inline-block text-sm text-[var(--blood)] underline decoration-dotted underline-offset-4 hover:text-[var(--blood-bright)]"
          >
            Consulter un personnage →
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="region" className="ledger-label">
            région
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="ink-field"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleRefresh} className="ghost-btn h-10 px-3 text-xs">
            rafraîchir
          </button>
        </div>
      </header>

      <div className="mt-6">
        {state.status === "loading" && <LoadingState />}
        {state.status === "error" && <ErrorState message={state.message} />}
        {state.status === "success" && <StatsView data={state.data} />}
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse bg-[var(--parchment-2)]/60" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border-l-2 border-[var(--blood)] bg-[var(--parchment-2)]/60 px-4 py-3">
      <p className="text-sm text-[var(--blood)]">Impossible de charger les stats.</p>
      <p className="mt-2 text-sm text-[var(--ink-faded)]">{message}</p>
      <p className="mt-2 text-xs text-[var(--ink-mute)]">
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

function StatsView({ data }: { data: RegionStat }) {
  const statusEntries = Object.entries(data.byStatus).sort((a, b) => b[1] - a[1]);
  const popEntries = Object.entries(data.byPopulation).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v), 1);
  const maxPop = Math.max(...popEntries.map(([, v]) => v), 1);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="ledger-label mb-3">État de la région {data.region.toUpperCase()}</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
          <div className="ledger-row">
            <span className="lr-key">Royaumes dénombrés</span>
            <span className="lr-leader" />
            <span className="num lr-val">{data.total}</span>
          </div>
          <div className="ledger-row">
            <span className="lr-key">En ligne</span>
            <span className="lr-leader" />
            <span className="num lr-val text-[var(--rune)]">{data.online}</span>
          </div>
          <div className="ledger-row">
            <span className="lr-key">Avec file d’attente</span>
            <span className="lr-leader" />
            <span className="num lr-val">{data.queued}</span>
          </div>
          <div className="ledger-row">
            <span className="lr-key">Disponibilité</span>
            <span className="lr-leader" />
            <span className="num lr-val">
              {data.total > 0 ? `${Math.round((data.online / data.total) * 100)}%` : "—"}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="ledger-label mb-3">Par statut</h2>
        <ul className="flex flex-col gap-3">
          {statusEntries.map(([key, value]) => (
            <li key={key}>
              <div className="ledger-row">
                <span className="lr-key">{STATUS_LABELS[key] ?? key}</span>
                <span className="lr-leader" />
                <span className="num lr-val">{value}</span>
              </div>
              <div className="ledger-bar-track mt-1.5">
                <div
                  className="ledger-bar-fill"
                  style={{ width: `${(value / maxStatus) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="ledger-label mb-3">Par population</h2>
        <ul className="flex flex-col gap-3">
          {popEntries.map(([key, value]) => (
            <li key={key}>
              <div className="ledger-row">
                <span className="lr-key">{POP_LABELS[key] ?? key}</span>
                <span className="lr-leader" />
                <span className="num lr-val">{value}</span>
              </div>
              <div className="ledger-bar-track mt-1.5">
                <div
                  className="ledger-bar-fill"
                  style={{ width: `${(value / maxPop) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="ledger-label mb-3">Royaumes d’attention</h2>
        {data.topRealms.length === 0 ? (
          <p className="text-sm italic text-[var(--ink-mute)]">Aucun royaume à signaler.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {data.topRealms.map((r) => (
              <li key={r.slug} className="ledger-row">
                <span className="lr-key">
                  {r.name}{" "}
                  <span className="text-xs text-[var(--ink-mute)]">· {POP_LABELS[r.population] ?? r.population}</span>
                </span>
                <span className="lr-leader" />
                <span className={`lr-val ${r.status === "UP" ? "text-[var(--rune)]" : "text-[var(--blood)]"}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                  {r.hasQueue && (
                    <span className="ml-2 text-xs text-[var(--blood-bright)]">file</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
