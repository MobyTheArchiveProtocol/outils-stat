import Link from "next/link";

import { isBlizzardConfigured } from "@/lib/blizzard/oauth";

const games = [
  {
    slug: "wow",
    name: "World of Warcraft",
    blurb: "Statut des royaumes connectés, files d’attente, population — par région.",
    emblem: "/emblem-wow.svg",
  },
];

export default function Home() {
  const configured = isBlizzardConfigured();

  return (
    <div className="flex flex-col gap-8">
      <section className="panel">
        <div className="panel-head">
          <span className="kicker">outils-stat</span>
          <span className="kicker text-[var(--muted)]">sans pub · sans tracking</span>
        </div>
        <div className="px-6 py-8 sm:px-9">
          <h1
            className="text-3xl font-semibold uppercase leading-tight tracking-tight text-[var(--text)] sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Les stats de vos jeux, comme à l’époque.
          </h1>
          <span className="ornament mt-3" aria-hidden />
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-soft)]">
            Pas de publicité. Pas de tracking. Pas de distraction. Juste la data de votre compte et
            de vos jeux, présentée clairement. On commence par Blizzard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/stats/wow" className="btn-gold">
              Voir les stats WoW
            </Link>
            <Link href="/a-propos" className="btn-ghost">
              Le concept
            </Link>
          </div>
          {!configured && (
            <p className="mt-6 border-l-2 border-[var(--warn)] bg-[var(--warn)]/10 px-4 py-3 text-sm text-[var(--text-soft)]">
              Le serveur n’a pas encore de credentials Blizzard. Renseignez{" "}
              <code className="font-mono text-[var(--gold-bright)]">BATTLE_NET_CLIENT_ID</code> et{" "}
              <code className="font-mono text-[var(--gold-bright)]">BATTLE_NET_CLIENT_SECRET</code>{" "}
              pour activer la data.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4 px-1">Sources disponibles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {games.map((g) => (
            <Link key={g.slug} href={`/stats/${g.slug}`} className="panel block overflow-hidden transition-colors hover:border-[var(--gold)]">
              <div
                className="relative h-28 w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${g.emblem}")`, backgroundColor: "var(--panel-2)" }}
                aria-hidden
              />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[var(--text)]">{g.name}</h3>
                  <span className="kicker">dispo</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-soft)]">{g.blurb}</p>
                <p className="mt-4 text-xs text-[var(--gold)]">ouvrir →</p>
              </div>
            </Link>
          ))}
          <div className="panel border-dashed p-5 opacity-80">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium muted">Steam · Riot · et plus</h3>
              <span className="kicker text-[var(--muted)]">à venir</span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              D’autres sources arrivent dès qu’une API utile ou marrante est disponible.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
