import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import Link from "next/link";
import AccountWidget from "./AccountWidget";
import "./globals.css";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "600", "700"] });
const ebGaramond = EB_Garamond({ variable: "--font-ebgaramond", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: {
    default: "outils-stat — chroniques de data, sans bruit",
    template: "%s — outils-stat",
  },
  description:
    "Consultez les statistiques de vos jeux. Un registre de data brute, zéro publicité, zéro tracking — l'esprit des vieux grimoires de stats.",
  robots: { index: true, follow: true },
  referrer: "no-referrer",
  openGraph: {
    title: "outils-stat",
    description: "Stats de jeu, sans bruit. Data brute, zéro pub, zéro tracking.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#15110b",
  width: "device-width",
  initialScale: 1,
};

const NAV = [
  { href: "/stats/wow", label: "Royaumes" },
  { href: "/stats/wow/character", label: "Personnage" },
  { href: "/a-propos", label: "Le concept" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${ebGaramond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Chamber banner: dark, gilded, with crest */}
        <header className="relative border-b border-[var(--chamber-edge)]">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <span
                className="grid h-9 w-9 place-items-center border border-[var(--gold-deep)] text-lg text-[var(--gold-leaf)]"
                style={{ fontFamily: "var(--font-display)" }}
                aria-hidden
              >
                ⚔
              </span>
              <span
                className="text-xl tracking-wide text-[var(--gold-leaf)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                outils-stat
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--gold-leaf)]/80">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="border-b border-dotted border-transparent transition-colors hover:border-[var(--gold)] hover:text-[var(--gold-leaf)]"
                >
                  {n.label}
                </Link>
              ))}
              <span className="mx-1 hidden h-4 w-px bg-[var(--chamber-edge)] sm:inline-block" />
              <AccountWidget />
            </nav>
          </div>
        </header>

        {/* Parchment chamber: the manuscript page sits inside */}
        <main className="relative flex flex-1 flex-col py-8 sm:py-12">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
        </main>

        {/* Colophon / wax-seal footer */}
        <footer className="relative mt-auto border-t border-[var(--chamber-edge)] pb-10 pt-8">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="fleuron mb-4 text-[var(--gold-deep)]">❦ ❦ ❦</div>
            <p className="text-center text-xs text-[var(--gold-leaf)]/70" style={{ fontFamily: "var(--font-body)" }}>
              Data Blizzard © Blizzard Entertainment · Pas de pub, pas de tracking. Que la data,
              gravée dans la pierre.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
