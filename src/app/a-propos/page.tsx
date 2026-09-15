import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "Le concept d’outils-stat : stats de jeu, sans publicité ni tracking.",
};

export default function AboutPage() {
  return (
    <article className="manuscript ornament-corners gilt-frame">
      <header className="text-center">
        <p className="chap-label mb-4">⚔ Colophon</p>
        <h1 className="h-chronicle text-3xl uppercase sm:text-5xl">À propos</h1>
        <hr className="gilt-rule mx-auto mt-5 w-2/3" />
      </header>

      <div className="mt-10 flex flex-col gap-6 text-[var(--ink-soft)]">
        <p className="dropcap text-lg leading-relaxed text-[var(--ink)]">
          outils-stat existe pour retrouver la simplicité des anciens sites de tracking de stats de
          jeu : une interface épurée, de la data claire, et rien d’autre.
        </p>
        <p className="leading-relaxed">
          Aucune publicité. Aucun tracker tiers. Aucune collecte de données personnelles pour la
          revente ou l’analyse. Le <code className="text-[var(--blood)]">referrer</code> est
          désactivé, les robots d’indexation restent respectés, et les requêtes vers les APIs de jeu
          se font depuis le serveur — pas depuis votre navigateur.
        </p>
        <p className="leading-relaxed">
          La source initiale est l’API Battle.net (Blizzard), gratuite et documentée. Le projet
          récupère des données publiques de jeu (statut des royaumes WoW, population…) via le flux
          OAuth 2.0 <em>client credentials</em>. Les données liées au compte joueur (profil,
          personnages) arriveront via le flux d’autorisation quand l’API le permettra.
        </p>
        <p className="leading-relaxed">
          D’autres sources (Steam, Riot…) seront ajoutées dès qu’une API utile ou marrante est
          disponible. L’objectif reste le même : de la data, proprement.
        </p>
      </div>

      <div className="fleuron mt-10">❦</div>
    </article>
  );
}
