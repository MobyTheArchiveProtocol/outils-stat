import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "Le concept d’outils-stat : stats de jeu, sans publicité ni tracking.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-20">
      <span className="eyebrow">⚔ Sang &amp; or</span>
      <h1 className="h1 mt-2 text-3xl uppercase tracking-tight">À propos</h1>
      <div className="mt-8 flex flex-col gap-6 text-[var(--muted)]">
        <p className="text-lg leading-relaxed text-[var(--foreground-bright)]">
          outils-stat existe pour retrouver la simplicité des anciens sites de tracking de stats de
          jeu : une interface épurée, de la data claire, et rien d’autre.
        </p>
        <p className="leading-relaxed">
          Aucune publicité. Aucun tracker tiers. Aucune collecte de données personnelles pour la
          revente ou l’analyse. Le <code className="text-[var(--gold-bright)]">referrer</code>{" "}
          est désactivé, les robots d’indexation restent respectés, et les requêtes vers les APIs de
          jeu se font depuis le serveur — pas depuis votre navigateur.
        </p>
        <p className="leading-relaxed">
          La source initiale est l’API Battle.net (Blizzard), gratuite et documentée. Le projet
          récupère des données publiques de jeu (statut des royaumes WoW, population…) via le flux
          OAuth 2.0 <em>client credentials</em>. Les données liées au compte joueur (profil, personnages)
          arriveront via le flux d’autorisation quand l’API le permettra.
        </p>
        <p className="leading-relaxed">
          D’autres sources (Steam, Riot…) seront ajoutées dès qu’une API utile ou marrante est
          disponible. L’objectif reste le même : de la data, proprement.
        </p>
      </div>
    </div>
  );
}
