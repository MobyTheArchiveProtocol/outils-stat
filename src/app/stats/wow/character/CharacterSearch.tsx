"use client";

import { useCallback, useState, type ReactNode } from "react";
import Image from "next/image";

import { classColor, factionColor, qualityColor } from "@/lib/blizzard/colors";
import { DEFAULT_REGION, REGIONS, type Region } from "@/lib/blizzard/regions";
import type { CharacterDetails, CharacterProfile, CharacterProgression } from "@/lib/blizzard/types";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; notFound?: boolean }
  | { status: "success"; data: CharacterProfile; progression: CharacterProgression | null; details: CharacterDetails | null };

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
      setState({ status: "success", data, progression: null, details: null });

      try {
        const progRes = await fetch(`/api/blizzard/wow/character/progression?${params.toString()}`, {
          cache: "no-store",
        });
        if (progRes.ok) {
          const progJson = await progRes.json();
          setState({ status: "success", data, progression: progJson as CharacterProgression, details: null });
        }
      } catch {
        // progression stays null
      }

      try {
        const detailsRes = await fetch(`/api/blizzard/wow/character/details?${params.toString()}`, {
          cache: "no-store",
        });
        if (detailsRes.ok) {
          const detailsJson = await detailsRes.json();
          setState((prev) =>
            prev.status === "success"
              ? { ...prev, details: detailsJson as CharacterDetails }
              : prev
          );
        }
      } catch {
        // details stays null
      }
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : "Erreur réseau" });
    }
  }, [region, realm, name]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="kicker">World of Warcraft</span>
        <h1 className="mt-2 text-2xl font-semibold uppercase tracking-tight text-[var(--text)] sm:text-3xl">
          Recherche de personnage
        </h1>
        <p className="mt-1 text-sm muted">
          Statut, progression, collections · source Battle.net Profile API
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
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
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="realm" className="kicker">
            royaume (slug)
          </label>
          <input
            id="realm"
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder="hyjal, draenor, tarren-mill…"
            className="field"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="name" className="kicker">
            nom
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="varian…"
            className="field"
          />
        </div>
        <button type="submit" disabled={state.status === "loading"} className="btn-gold">
          {state.status === "loading" ? "…" : "Chercher"}
        </button>
      </form>

      {state.status === "loading" && (
        <div className="h-64 animate-pulse panel" />
      )}

      {state.status === "error" && (
        <div className="panel border-l-2 border-l-[var(--danger)] p-5">
          <p className="text-sm text-[var(--danger)]">
            {state.notFound ? "Personnage introuvable." : "Impossible de charger le personnage."}
          </p>
          <p className="mt-2 text-sm text-[var(--text-soft)]">{state.message}</p>
          {state.notFound && (
            <p className="mt-2 text-xs muted">
              Vérifiez le slug du royaume et le nom, ou la région sélectionnée.
            </p>
          )}
        </div>
      )}

      {state.status === "success" && (
        <ProfileView data={state.data} progression={state.progression} details={state.details} />
      )}
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string | number | null; accent?: string }) {
  return (
    <div className="stat-row">
      <span className="k">{label}</span>
      <span className="leader" />
      <span className={`v num ${accent ?? ""}`}>{value ?? "—"}</span>
    </div>
  );
}

function ProfileView({
  data,
  progression,
  details,
}: {
  data: CharacterProfile;
  progression: CharacterProgression | null;
  details: CharacterDetails | null;
}) {
  const cColor = classColor(data.className);
  const fColor = data.factionName ? factionColor(data.factionName) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="panel">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          {data.avatarUrl && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-[var(--gold-line)] bg-black/40">
              <Image src={data.avatarUrl} alt={data.name} fill sizes="96px" className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold uppercase tracking-tight" style={{ color: cColor ?? "var(--text)" }}>
                {data.name}
              </h2>
              {!data.isValid && (
                <span className="text-xs uppercase tracking-widest text-[var(--warn)]">invalide</span>
              )}
            </div>
            <p className="text-sm text-[var(--text-soft)]">
              {data.raceName}{" "}
              <span style={{ color: cColor ?? "var(--text)" }}>{data.className}</span>
              {data.specName && ` · ${data.specName}`} · Niv. {data.level}
            </p>
            <p className="text-sm muted">
              {data.realmName} ({data.realmSlug}) · région {data.region.toUpperCase()}
              {data.factionName && (
                <>
                  {" · "}
                  <span style={{ color: fColor ?? "var(--text-soft)" }}>{data.factionName}</span>
                </>
              )}
            </p>
            {data.guildName && (
              <p className="text-sm" style={{ color: fColor ?? "var(--gold-bright)" }}>
                ⟨ {data.guildName} ⟩
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel">
          <div className="panel-head">
            <h3 className="section-title">Aperçu</h3>
          </div>
          <div className="p-4">
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
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3 className="section-title">Équipement</h3>
          </div>
          <div className="p-0">
            {data.equipment.length === 0 ? (
              <p className="p-4 text-sm muted">Aucun équipement renvoyé.</p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Emplacement</th>
                    <th>Objet</th>
                    <th className="right">iLvl</th>
                  </tr>
                </thead>
                <tbody>
                  {data.equipment.map((item) => (
                    <tr key={item.slot}>
                      <td className="muted">{item.slotName}</td>
                      <td style={{ color: qualityColor(item.quality) }}>{item.name}</td>
                      <td className="right num">{item.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {progression === null ? (
        <div className="h-40 animate-pulse panel" />
      ) : (
        <ProgressionSections progression={progression} />
      )}

      {details !== null && <DetailsSections details={details} />}
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Section({
  title,
  right,
  children,
  empty,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  empty?: string;
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3 className="section-title">{title}</h3>
        {right}
      </div>
      <div className="p-4">
        {empty ? (
          <p className="text-sm muted">{empty}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ProgressionSections({ progression }: { progression: CharacterProgression }) {
  return (
    <div className="flex flex-col gap-4">
      {progression.achievements && (
        <Section
          title="Hauts faits"
          right={
            <span className="num text-sm text-[var(--gold-bright)]">
              {progression.achievements.totalPoints.toLocaleString("fr-FR")} pts ·{" "}
              {progression.achievements.totalQuantity} complétés
            </span>
          }
        >
          {progression.achievements.recent.length === 0 ? (
            <p className="text-sm muted">Aucun haut fait récent.</p>
          ) : (
            <table className="tbl">
              <tbody>
                {progression.achievements.recent.map((a, i) => (
                  <tr key={i}>
                    <td className="text-[var(--text-soft)]">{a.name}</td>
                    <td className="right num muted">
                      {a.completedAt ? new Date(a.completedAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {progression.mythicPlus && (
        <Section title={`Mythic+ · saison ${progression.mythicPlus.seasonId ?? "?"}`}>
          {progression.mythicPlus.bestRuns.length === 0 ? (
            <p className="text-sm muted">Aucune clé enregistrée pour cette saison.</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Donjon</th>
                  <th>Clé</th>
                  <th>Temps</th>
                  <th className="right">Statut</th>
                </tr>
              </thead>
              <tbody>
                {progression.mythicPlus.bestRuns.map((run, i) => (
                  <tr key={i}>
                    <td className="text-[var(--text)]">{run.dungeonName}</td>
                    <td className="num text-[var(--gold-bright)]">+{run.keystoneLevel}</td>
                    <td className="num muted">{formatDuration(run.duration)}</td>
                    <td className="right">
                      <span className={run.completedWithinTime ? "text-[var(--rune)]" : "text-[var(--warn)]"}>
                        {run.completedWithinTime ? "dans le temps" : "hors temps"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {progression.statistics && progression.statistics.length > 0 && (
        <Section title="Statistiques notables">
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {progression.statistics
              .slice()
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 24)
              .map((s, i) => (
                <div key={i} className="stat-row">
                  <span className="k truncate">{s.name}</span>
                  <span className="leader" />
                  <span className="v num">{s.quantity.toLocaleString("fr-FR")}</span>
                </div>
              ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function DetailsSections({ details }: { details: CharacterDetails }) {
  return (
    <div className="flex flex-col gap-4">
      {details.collections && (
        <Section
          title="Collections"
          right={
            <span className="num text-sm text-[var(--gold-bright)]">
              {details.collections.mounts?.length ?? 0} montures ·{" "}
              {details.collections.pets?.length ?? 0} mascottes ·{" "}
              {details.collections.toys?.length ?? 0} jouets
            </span>
          }
          empty={
            details.collections.needsAuth
              ? "Collections nécessite un flux OAuth utilisateur (connexion Battle.net)."
              : undefined
          }
        >
          <table className="tbl">
            <thead>
              <tr>
                <th>Nom</th>
                <th className="right">Type</th>
              </tr>
            </thead>
            <tbody>
              {[
                ...(details.collections.mounts ?? []).map((m) => ({ name: m.name, sub: m.isFavorite ? "monture ★" : "monture" })),
                ...(details.collections.pets ?? []).map((p) => ({
                  name: p.name,
                  sub: `mascotte · niv. ${p.level} · ${p.qualityName}`,
                })),
                ...(details.collections.toys ?? []).map((t) => ({ name: t.name, sub: "jouet" })),
              ]
                .slice(0, 40)
                .map((item, i) => (
                  <tr key={i}>
                    <td className="text-[var(--text-soft)]">{item.name}</td>
                    <td className="right muted">{item.sub}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Section>
      )}

      {details.raids && details.raids.expansions.length > 0 && (
        <Section title="Raids">
          <div className="flex flex-col gap-5">
            {details.raids.expansions.map((exp, ei) => (
              <div key={ei}>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                  {exp.name}
                </p>
                {exp.instances.map((inst, ii) => (
                  <div key={ii} className="mb-3">
                    <p className="mb-1 text-xs muted">{inst.name}</p>
                    <table className="tbl">
                      <tbody>
                        {inst.modes.map((mode, mi) => (
                          <tr key={mi}>
                            <td className="text-[var(--text-soft)]">{mode.difficultyName}</td>
                            <td className="right num">
                              {mode.completedCount}/{mode.totalCount} · {mode.statusName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      )}

      {details.dungeons && details.dungeons.expansions.length > 0 && (
        <Section title="Donjons">
          <div className="flex flex-col gap-5">
            {details.dungeons.expansions.map((exp, ei) => (
              <div key={ei}>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                  {exp.name}
                </p>
                {exp.instances.map((inst, ii) => (
                  <div key={ii} className="mb-3">
                    <p className="mb-1 text-xs muted">{inst.name}</p>
                    <table className="tbl">
                      <tbody>
                        {inst.modes.map((mode, mi) => (
                          <tr key={mi}>
                            <td className="text-[var(--text-soft)]">{mode.difficultyName}</td>
                            <td className="right num">
                              {mode.completedCount}/{mode.totalCount} · {mode.statusName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      )}

      {details.pvp && (
        <Section
          title="PvP"
          right={
            <span className="num text-sm text-[var(--gold-bright)]">
              {details.pvp.honorLevel} honneur · {details.pvp.honorableKills.toLocaleString("fr-FR")} kills
            </span>
          }
        >
          <div className="flex flex-col gap-5">
            {details.pvp.brackets.length > 0 && (
              <div>
                <p className="mb-2 text-xs muted">Brackets</p>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Bracket</th>
                      <th>Rating</th>
                      <th className="right">Saison</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.pvp.brackets.map((b, i) => (
                      <tr key={i}>
                        <td className="uppercase text-[var(--text)]">{b.bracket}</td>
                        <td className="num text-[var(--gold-bright)]">{b.rating}</td>
                        <td className="right muted">
                          {b.seasonWon}–{b.seasonLost} ({b.seasonPlayed})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {details.pvp.mapStatistics.length > 0 && (
              <div>
                <p className="mb-2 text-xs muted">Champs de bataille</p>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Carte</th>
                      <th className="right">Bilan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.pvp.mapStatistics.map((m, i) => (
                      <tr key={i}>
                        <td className="text-[var(--text-soft)]">{m.mapName}</td>
                        <td className="right num muted">
                          {m.won}–{m.lost} ({m.played})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Section>
      )}

      {details.professions &&
        (details.professions.primaries.length > 0 || details.professions.secondaries.length > 0) && (
          <Section title="Professions">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Métier</th>
                  <th>Niveau</th>
                  <th className="right">Recettes</th>
                </tr>
              </thead>
              <tbody>
                {[...details.professions.primaries, ...details.professions.secondaries].map((p, i) => (
                  <tr key={i}>
                    <td className="text-[var(--text)]">{p.name}</td>
                    <td className="muted">
                      {p.tiers.map((t, ti) => (
                        <span key={ti} className="mr-2">
                          {t.tierName} {t.skillPoints}/{t.maxSkillPoints}
                        </span>
                      ))}
                    </td>
                    <td className="right num">{p.tiers[0]?.recipeCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

      {details.reputations && details.reputations.length > 0 && (
        <Section title="Réputations">
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {details.reputations
              .filter((r) => r.tier > 0)
              .slice(0, 30)
              .map((r, i) => (
                <div key={i} className="stat-row">
                  <span className="k truncate">{r.faction}</span>
                  <span className="leader" />
                  <span className="v num muted">
                    {r.standingName} ({r.value}/{r.max})
                  </span>
                </div>
              ))}
          </div>
        </Section>
      )}

      {details.titles && details.titles.list.length > 0 && (
        <Section
          title="Titres"
          right={<span className="num text-sm text-[var(--gold-bright)]">{details.titles.list.length}</span>}
        >
          {details.titles.active && (
            <p className="mb-3 text-sm text-[var(--gold-bright)]">« {details.titles.active} » (actif)</p>
          )}
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {details.titles.list.slice(0, 40).map((t, i) => (
              <div key={i} className="stat-row">
                <span className="k truncate text-[var(--text-soft)]">{t}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
