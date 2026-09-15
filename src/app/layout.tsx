import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import Link from "next/link";
import AccountWidget from "./AccountWidget";
import "./globals.css";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "600", "700"] });
const ebGaramond = EB_Garamond({ variable: "--font-ebgaramond", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: {
    default: "outils-stat — stats de jeu, sans bruit",
    template: "%s — outils-stat",
  },
  description:
    "Consultez les statistiques de vos jeux. Data brute, zéro publicité, zéro tracking.",
  robots: { index: true, follow: true },
  referrer: "no-referrer",
  openGraph: {
    title: "outils-stat",
    description: "Stats de jeu, sans bruit. Data brute, zéro pub, zéro tracking.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0d",
  width: "device-width",
  initialScale: 1,
};

const NAV = [
  { href: "/stats/wow", label: "Royaumes" },
  { href: "/stats/wow/character", label: "Personnage" },
  { href: "/a-propos", label: "À propos" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${ebGaramond.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-[var(--gold-line)] bg-[var(--bg-2)]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                className="panel-title text-xl tracking-wide"
                style={{ fontFamily: "var(--font-display)" }}
              >
                outils-stat
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-[var(--text-soft)] transition-colors hover:text-[var(--gold-bright)]"
                >
                  {n.label}
                </Link>
              ))}
              <span className="mx-1 hidden h-4 w-px bg-[var(--panel-edge)] sm:inline-block" />
              <AccountWidget />
            </nav>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col py-8 sm:py-12">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
        </main>

        <footer className="mt-auto border-t border-[var(--gold-line)] bg-[var(--bg-2)]">
          <div className="mx-auto w-full max-w-6xl px-6 py-6">
            <p className="text-center text-xs muted">
              Data Blizzard © Blizzard Entertainment · Pas de pub, pas de tracking.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
