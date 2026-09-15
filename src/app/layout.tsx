import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AccountWidget from "./AccountWidget";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "outils-stat — stats de jeu, sans bruit",
    template: "%s — outils-stat",
  },
  description:
    "Visualisez les statistiques de vos jeux préférés. Data brute, interface épurée, zéro publicité, zéro tracking.",
  robots: { index: true, follow: true },
  referrer: "no-referrer",
  openGraph: {
    title: "outils-stat",
    description: "Stats de jeu, sans bruit. Data brute, zéro pub, zéro tracking.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="relative border-b border-[var(--border)]">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="group relative font-mono text-sm tracking-tight text-[var(--foreground)]">
              <span className="pointer-events-none absolute -inset-x-3 -inset-y-1 rounded-full bg-[var(--accent)]/0 blur-md transition-colors duration-300 group-hover:bg-[var(--accent)]/10" />
              <span className="relative">❄ outils-stat</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <Link href="/stats/wow" className="frost-link">
                WoW
              </Link>
              <Link href="/stats/wow/character" className="frost-link">
                Personnage
              </Link>
              <Link href="/a-propos" className="frost-link">
                À propos
              </Link>
            </nav>
            <AccountWidget />
          </div>
        </header>
        <main className="relative flex flex-1 flex-col">{children}</main>
        <footer className="relative border-t border-[var(--border)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
          <div className="mx-auto w-full max-w-5xl px-6 py-6 text-xs text-[var(--muted)]">
            ❄ Data Blizzard © Blizzard Entertainment · Pas de pub, pas de tracking. Juste de la data.
          </div>
        </footer>
      </body>
    </html>
  );
}
