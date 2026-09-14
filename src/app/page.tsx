import Link from "next/link";

import { isBlizzardConfigured } from "@/lib/blizzard/oauth";

const games = [
  {
    slug: "wow",
    name: "World of Warcraft",
    blurb: "Statut des royaumes connectés, files d’attente, population — par région.",
    available: true,
  },
];

export default function Home() {
  const configured = isBlizzardConfigured();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-20">
      <section className="flex flex-col gap-6 pb-20">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          data de jeu · sans bruit
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Les stats de vos jeux, comme à l’époque. Proprement.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Pas de publicité. Pas de tracking. Pas de distraction. Juste la data de votre compte et
          de vos jeux, présentée clairement. On commence par Blizzard.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/stats/wow"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Voir les stats WoW
          </Link>
          <Link
            href="/a-propos"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] px-6 text-sm font-medium transition-colors hover:border-[var(--muted)]"
          >
            Le concept
          </Link>
        </div>
        {!configured && (
          <p className="mt-2 max-w-xl rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Le serveur n’a pas encore de credentials Blizzard. Renseignez{" "}
            <code className="font-mono">BATTLE_NET_CLIENT_ID</code> et{" "}
            <code className="font-mono">BATTLE_NET_CLIENT_SECRET</code> pour activer la data.
          </p>
        )}
      </section>

      <section className="border-t border-[var(--border)] pt-12">
        <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Sources disponibles
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {games.map((g) => (
            <li
              key={g.slug}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--muted)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{g.name}</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                  dispo
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{g.blurb}</p>
              <Link
                href={`/stats/${g.slug}`}
                className="mt-4 inline-block font-mono text-xs text-[var(--foreground)] underline-offset-4 hover:underline"
              >
                ouvrir →
              </Link>
            </li>
          ))}
          <li className="rounded-2xl border border-dashed border-[var(--border)] p-6">
            <h3 className="text-lg font-medium text-[var(--muted)]">Steam · Riot · et plus</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              D’autres sources arrivent dès qu’une API utile ou marrante est disponible.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
