"use client";

import { useCallback, useState, type ReactNode } from "react";
import Image from "next/image";

import { DEFAULT_REGION, REGIONS, type Region } from "@/lib/blizzard/regions";
import type { CharacterDetails, CharacterProfile, CharacterProgression } from "@/lib/blizzard/types";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; notFound?: boolean }
  | { status: "success"; data: CharacterProfile; progression: CharacterProgression | null; details: CharacterDetails | null };

const QUALITY_COLORS: Record<string, string> = {
  POOR: "#9d9d9d",
  COMMON: "#1a1a1a",
  UNCOMMON: "#1eff00",
  RARE: "#0070dd",
  EPIC: "#a335ee",
  LEGENDARY: "#ff8000",
  ARTIFACT: "#a23b1a",
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
        // progression stays null — already displayed profile
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
    <article className="manuscript ornament-corners gilt-frame">
      <header className="border-b border-dotted border-[var(--ink-mute)] pb-6">
        <p className="chap-label">⚔ Chapitre II</p>
        <h1 className="h-chronicle mt-2 text-3xl uppercase sm:text-4xl">Registre du personnage</h1>
        <p className="mt-1 text-sm italic text-[var(--ink-faded)]">
          Inscrivez le royaume et le nom · source Battle.net Profile API
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
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
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="realm" className="ledger-label">
            royaume (slug)
          </label>
          <input
            id="realm"
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder="ex : hyjal, draenor, tarren-mill"
            className="ink-field"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="name" className="ledger-label">
            nom
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex : varian"
            className="ink-field"
          />
        </div>
        <button type="submit" disabled={state.status === "loading"} className="seal-btn">
          {state.status === "loading" ? "…" : "⚔ Inscire"}
        </button>
      </form>

      <div className="mt-6">
        {state.status === "loading" && (
          <div className="h-40 animate-pulse bg-[var(--parchment-2)]/60" />
        )}

        {state.status === "error" && (
          <div className="border-l-2 border-[var(--blood)] bg-[var(--parchment-2)]/60 px-4 py-3">
            <p className="text-sm text-[var(--blood)]">
              {state.notFound ? "Personnage introuvable." : "Impossible de charger le personnage."}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-faded)]">{state.message}</p>
            {state.notFound && (
              <p className="mt-2 text-xs text-[var(--ink-mute)]">
                Vérifiez le slug du royaume et le nom, ou la région sélectionnée.
              </p>
            )}
          </div>
        )}

        {state.status === "success" && (
          <ProfileView data={state.data} progression={state.progression} details={state.details} />
        )}
      </div>
    </article>
  );
}

function LedgerLine({ label, value, accent }: { label: string; value: string | number | null; accent?: string }) {
  return (
    <div className="ledger-row">
      <span className="lr-key">{label}</span>
      <span className="lr-leader" />
      <span className={`num lr-val ${accent ?? ""}`}>{value ?? "—"}</span>
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
  return (
    <div className="mt-2 flex flex-col gap-12">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {data.avatarUrl && (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden border-2 border-[var(--gold-deep)] shadow-[0_0_0_3px_var(--parchment)]">
            <Image src={data.avatarUrl} alt={data.name} fill sizes="112px" className="object-cover" unoptimized />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h2 className="h-chronicle text-3xl uppercase">
            {data.name}
            {!data.isValid && (
              <span className="ml-2 align-middle text-sm font-normal italic text-[var(--blood)]">
                · invalide
              </span>
            )}
          </h2>
          {data.guildName && (
            <p className="text-sm text-[var(--blood)]" style={{ fontFamily: "var(--font-display)" }}>
              ⟨ {data.guildName} ⟩
            </p>
          )}
          <p className="text-sm text-[var(--ink-soft)]">
            {data.raceName} {data.className} {data.specName && `· ${data.specName}`} · Niv. {data.level}
          </p>
          <p className="text-sm text-[var(--ink-faded)]">
            {data.realmName} <span className="text-[var(--ink-mute)]">({data.realmSlug})</span> · région{" "}
            {data.region.toUpperCase()} {data.factionName && `· ${data.factionName}`}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
        <section>
          <h3 className="ledger-label mb-3">Aperçu</h3>
          <LedgerLine label="Niveau" value={data.level} />
          <LedgerLine label="Points de hauts faits" value={data.achievementPoints.toLocaleString("fr-FR")} />
          <LedgerLine label="iLvl moyen" value={data.averageItemLevel} />
          <LedgerLine label="iLvl équipé" value={data.equippedItemLevel} />
          <LedgerLine label="Classe" value={data.className} />
          <LedgerLine label="Spécialisation" value={data.specName || "—"} />
          <LedgerLine label="Race" value={data.raceName || "—"} />
          <LedgerLine label="Faction" value={data.factionName || "—"} />
          <LedgerLine label="Guilde" value={data.guildName ?? "—"} />
        </section>

        <section>
          <h3 className="ledger-label mb-3">Équipement porté</h3>
          {data.equipment.length === 0 ? (
            <p className="text-sm italic text-[var(--ink-mute)]">Aucun équipement renvoyé.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {data.equipment.map((item) => (
                <li key={item.slot} className="ledger-row">
                  <span className="lr-key text-[var(--ink-mute)]">{item.slotName}</span>
                  <span className="lr-leader" />
                  <span className="lr-val flex items-baseline gap-2">
                    <span style={{ color: QUALITY_COLORS[item.quality] ?? "var(--ink)" }}>{item.name}</span>
                    <span className="num text-xs text-[var(--ink-mute)]">{item.level}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {progression === null ? (
        <div className="h-40 animate-pulse bg-[var(--parchment-2)]/60" />
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

function Chapter({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="ledger-label mb-3">{title}</h3>
      {children}
    </section>
  );
}

function ProgressionSections({ progression }: { progression: CharacterProgression }) {
  return (
    <div className="flex flex-col gap-12">
      {progression.achievements && (
        <Chapter title="Hauts faits">
          <div className="mb-3 flex items-center justify-between text-sm text-[var(--ink-faded)]">
            <span>Points accumulés</span>
            <span className="num text-[var(--blood)]">
              {progression.achievements.totalPoints.toLocaleString("fr-FR")} pts ·{" "}
              {progression.achievements.totalQuantity} complétés
            </span>
          </div>
          {progression.achievements.recent.length === 0 ? (
            <p className="text-sm italic text-[var(--ink-mute)]">Aucun haut fait récent.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {progression.achievements.recent.map((a, i) => (
                <li key={i} className="ledger-row">
                  <span className="lr-key">{a.name}</span>
                  <span className="lr-leader" />
                  <span className="num lr-val text-[var(--ink-mute)]">
                    {a.completedAt ? new Date(a.completedAt).toLocaleDateString("fr-FR") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Chapter>
      )}

      {progression.mythicPlus && (
        <Chapter title={`Mythic+ · saison ${progression.mythicPlus.seasonId ?? "?"}`}>
          {progression.mythicPlus.bestRuns.length === 0 ? (
            <p className="text-sm italic text-[var(--ink-mute)]">
              Aucune clé enregistrée pour cette saison.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {progression.mythicPlus.bestRuns.map((run, i) => (
                <li key={i}>
                  <div className="ledger-row">
                    <span className="lr-key">
                      {run.dungeonName}
                      <span className="ml-2 text-xs text-[var(--ink-mute)]">· +{run.keystoneLevel}</span>
                    </span>
                    <span className="lr-leader" />
                    <span className="lr-val text-sm">
                      {run.completedWithinTime ? (
                        <span className="text-[var(--rune)]">dans le temps</span>
                      ) : (
                        <span className="text-[var(--blood)]">hors temps</span>
                      )}
                      <span className="ml-2 num text-[var(--ink-mute)]">{formatDuration(run.duration)}</span>
                    </span>
                  </div>
                  {run.affixes.length > 0 && (
                    <p className="mt-0.5 pl-1 text-xs italic text-[var(--ink-mute)]">
                      {run.affixes.join(" · ")} — {new Date(run.completedAt).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Chapter>
      )}

      {progression.statistics && progression.statistics.length > 0 && (
        <Chapter title="Statistiques notables">
          <ul className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
            {progression.statistics
              .slice()
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 24)
              .map((s, i) => (
                <li key={i} className="ledger-row">
                  <span className="lr-key truncate">{s.name}</span>
                  <span className="lr-leader" />
                  <span className="num lr-val">{s.quantity.toLocaleString("fr-FR")}</span>
                </li>
              ))}
          </ul>
        </Chapter>
      )}
    </div>
  );
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
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="ledger-label">{title}</h3>
        {right}
      </div>
      {empty ? <p className="text-sm italic text-[var(--ink-mute)]">{empty}</p> : <div>{children}</div>}
    </section>
  );
}

function DetailsSections({ details }: { details: CharacterDetails }) {
  return (
    <div className="flex flex-col gap-12 border-t border-dotted border-[var(--ink-mute)] pt-12">
      {details.collections && (
        <Section
          title="Collections"
          right={
            <span className="num text-sm text-[var(--blood)]">
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
          <ul className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ...(details.collections.mounts ?? []).map((m) => ({ name: m.name, sub: m.isFavorite ? "★ favori" : "monture" })),
              ...(details.collections.pets ?? []).map((p) => ({
                name: p.name,
                sub: `mascotte · niv. ${p.level} · ${p.qualityName}`,
              })),
              ...(details.collections.toys ?? []).map((t) => ({ name: t.name, sub: "jouet" })),
            ]
              .slice(0, 36)
              .map((item, i) => (
                <li key={i} className="ledger-row">
                  <span className="lr-key truncate">{item.name}</span>
                  <span className="lr-leader" />
                  <span className="lr-val text-xs text-[var(--ink-mute)]">{item.sub}</span>
                </li>
              ))}
          </ul>
        </Section>
      )}

      {details.raids && details.raids.expansions.length > 0 && (
        <Section title="Raids">
          <div className="flex flex-col gap-6">
            {details.raids.expansions.map((exp, ei) => (
              <div key={ei}>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                  {exp.name}
                </p>
                {exp.instances.map((inst, ii) => (
                  <div key={ii} className="mb-3">
                    <p className="text-xs italic text-[var(--ink-mute)]">{inst.name}</p>
                    {inst.modes.map((mode, mi) => (
                      <div key={mi} className="ledger-row">
                        <span className="lr-key text-[var(--ink-faded)]">{mode.difficultyName}</span>
                        <span className="lr-leader" />
                        <span className="num lr-val">
                          {mode.completedCount}/{mode.totalCount} · {mode.statusName}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      )}

      {details.dungeons && details.dungeons.expansions.length > 0 && (
        <Section title="Donjons">
          <div className="flex flex-col gap-6">
            {details.dungeons.expansions.map((exp, ei) => (
              <div key={ei}>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                  {exp.name}
                </p>
                {exp.instances.map((inst, ii) => (
                  <div key={ii} className="mb-3">
                    <p className="text-xs italic text-[var(--ink-mute)]">{inst.name}</p>
                    {inst.modes.map((mode, mi) => (
                      <div key={mi} className="ledger-row">
                        <span className="lr-key text-[var(--ink-faded)]">{mode.difficultyName}</span>
                        <span className="lr-leader" />
                        <span className="num lr-val">
                          {mode.completedCount}/{mode.totalCount} · {mode.statusName}
                        </span>
                      </div>
                    ))}
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
            <span className="num text-sm text-[var(--blood)]">
              {details.pvp.honorLevel} honneur · {details.pvp.honorableKills.toLocaleString("fr-FR")} kills
            </span>
          }
        >
          <div className="flex flex-col gap-6">
            {details.pvp.brackets.length > 0 && (
              <div>
                <p className="mb-2 text-xs italic text-[var(--ink-mute)]">Brackets</p>
                <ul className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
                  {details.pvp.brackets.map((b, i) => (
                    <li key={i} className="ledger-row">
                      <span className="lr-key uppercase">{b.bracket}</span>
                      <span className="lr-leader" />
                      <span className="lr-val">
                        <span className="num text-[var(--blood)]">{b.rating}</span>
                        <span className="ml-2 text-xs text-[var(--ink-mute)]">
                          {b.seasonWon}–{b.seasonLost}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {details.pvp.mapStatistics.length > 0 && (
              <div>
                <p className="mb-2 text-xs italic text-[var(--ink-mute)]">Champs de bataille</p>
                <ul className="flex flex-col gap-1">
                  {details.pvp.mapStatistics.map((m, i) => (
                    <li key={i} className="ledger-row">
                      <span className="lr-key">{m.mapName}</span>
                      <span className="lr-leader" />
                      <span className="num lr-val text-[var(--ink-mute)]">
                        {m.won}–{m.lost} ({m.played})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {details.professions &&
        (details.professions.primaries.length > 0 || details.professions.secondaries.length > 0) && (
          <Section title="Professions">
            <ul className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
              {[...details.professions.primaries, ...details.professions.secondaries].map((p, i) => (
                <li key={i} className="ledger-row">
                  <span className="lr-key">
                    {p.name}
                    {p.tiers.map((t, ti) => (
                      <span key={ti} className="ml-1 text-xs text-[var(--ink-mute)]">
                        · {t.tierName} {t.skillPoints}/{t.maxSkillPoints}
                      </span>
                    ))}
                  </span>
                  <span className="lr-leader" />
                  <span className="num lr-val text-[var(--ink-mute)]">{p.tiers[0]?.recipeCount ?? 0} rec.</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

      {details.reputations && details.reputations.length > 0 && (
        <Section title="Réputations">
          <ul className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
            {details.reputations
              .filter((r) => r.tier > 0)
              .slice(0, 30)
              .map((r, i) => (
                <li key={i} className="ledger-row">
                  <span className="lr-key truncate">{r.faction}</span>
                  <span className="lr-leader" />
                  <span className="num lr-val text-[var(--ink-mute)]">
                    {r.standingName} ({r.value}/{r.max})
                  </span>
                </li>
              ))}
          </ul>
        </Section>
      )}

      {details.titles && details.titles.list.length > 0 && (
        <Section
          title="Titres"
          right={<span className="num text-sm text-[var(--blood)]">{details.titles.list.length}</span>}
        >
          {details.titles.active && (
            <p className="mb-3 text-sm italic text-[var(--blood)]">« {details.titles.active} » — porté actuellement</p>
          )}
          <ul className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
            {details.titles.list.slice(0, 40).map((t, i) => (
              <li key={i} className="ledger-row">
                <span className="lr-key truncate text-[var(--ink-faded)]">{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
