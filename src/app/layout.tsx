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
    "Consultez les statistiques de vos jeux. Annuaire de data brute, zéro publicité, zéro tracking — l'esprit des vieux grimoires de stats.",
  robots: { index: true, follow: true },
  referrer: "no-referrer",
  openGraph: {
    title: "outils-stat",
    description: "Stats de jeu, sans bruit. Data brute, zéro pub, zéro tracking.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${ebGaramond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="relative border-b border-[var(--border-gold)]">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="h1 text-lg tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ⚔ outils-stat
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/stats/wow" className="transition-colors hover:text-[var(--gold-bright)]">
                WoW
              </Link>
              <Link
                href="/stats/wow/character"
                className="transition-colors hover:text-[var(--gold-bright)]"
              >
                Personnage
              </Link>
              <Link href="/a-propos" className="transition-colors hover:text-[var(--gold-bright)]">
                À propos
              </Link>
            </nav>
            <AccountWidget />
          </div>
        </header>
        <main className="relative flex flex-1 flex-col">{children}</main>
        <footer className="relative border-t border-[var(--border-gold)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />
          <div className="mx-auto w-full max-w-5xl px-6 py-6">
            <div className="glyph-sep mb-3 text-xs">◆ ◆ ◆</div>
            <p className="text-center text-xs text-[var(--muted)]">
              Data Blizzard © Blizzard Entertainment · Pas de pub, pas de tracking. Que la data, gravée dans la pierre.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
