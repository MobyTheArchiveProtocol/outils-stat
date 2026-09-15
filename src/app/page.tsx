import Link from "next/link";

import { isBlizzardConfigured } from "@/lib/blizzard/oauth";

const games = [
  {
    slug: "wow",
    name: "World of Warcraft",
    blurb: "Statut des royaumes connectés, files d’attente, population — par région.",
  },
];

export default function Home() {
  const configured = isBlizzardConfigured();

  return (
    <article className="manuscript ornament-corners gilt-frame">
      <header className="text-center">
        <p className="chap-label mb-4">⚔ Chroniques de data</p>
        <h1 className="h-chronicle text-4xl uppercase sm:text-6xl">outils-stat</h1>
        <hr className="gilt-rule mx-auto mt-5 w-2/3" />
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed italic text-[var(--ink-soft)]">
          Les statistiques de vos jeux, comme à l’époque. Proprement.
        </p>
      </header>

      <section className="mt-10">
        <p className="dropcap text-lg leading-relaxed text-[var(--ink)]">
          Pas de publicité. Pas de tracking. Pas de distraction. Juste la data de votre compte et
          de vos jeux, présentée clairement — comme on consignait jadis les hauts faits dans un
          registre, à l’encre et au couteau. On commence par Blizzard.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/stats/wow" className="seal-btn">
            ⚔ Ouvrir les stats WoW
          </Link>
          <Link href="/a-propos" className="ghost-btn">
            Le concept
          </Link>
        </div>

        {!configured && (
          <p className="mt-6 border-l-2 border-[var(--blood)] bg-[var(--parchment-2)]/60 px-4 py-3 text-sm text-[var(--ink-soft)]">
            Le serveur n’a pas encore de credentials Blizzard. Renseignez{" "}
            <code className="font-mono text-[var(--blood)]">BATTLE_NET_CLIENT_ID</code> et{" "}
            <code className="font-mono text-[var(--blood)]">BATTLE_NET_CLIENT_SECRET</code> pour
            activer la data.
          </p>
        )}
      </section>

      <div className="fleuron my-10">❦</div>

      <section>
        <h2 className="chap-label mb-5">Sources consignées</h2>
        <ul className="flex flex-col gap-3">
          {games.map((g) => (
            <li key={g.slug}>
              <Link href={`/stats/${g.slug}`} className="group block">
                <div className="ledger-row">
                  <span className="lr-key text-lg text-[var(--ink)] group-hover:text-[var(--blood)]">
                    {g.name}
                  </span>
                  <span className="lr-leader" />
                  <span className="chap-label lr-val">⚔ disponible</span>
                </div>
                <p className="mt-1 pl-1 text-sm text-[var(--ink-faded)]">{g.blurb}</p>
              </Link>
            </li>
          ))}
          <li>
            <div className="ledger-row">
              <span className="lr-key text-lg italic text-[var(--ink-faded)]">
                Steam · Riot · et plus
              </span>
              <span className="lr-leader" />
              <span className="chap-label lr-val text-[var(--ink-mute)]">à venir</span>
            </div>
            <p className="mt-1 pl-1 text-sm text-[var(--ink-mute)]">
              D’autres sources arrivent dès qu’une API utile ou marrante est disponible.
            </p>
          </li>
        </ul>
      </section>
    </article>
  );
}
