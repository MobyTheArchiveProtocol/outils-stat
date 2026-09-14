import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
        <header className="border-b border-[var(--border)]">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-mono text-sm tracking-tight text-[var(--foreground)]">
              outils-stat
            </Link>
            <nav className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <Link href="/stats/wow" className="transition-colors hover:text-[var(--foreground)]">
                WoW
              </Link>
              <Link href="/a-propos" className="transition-colors hover:text-[var(--foreground)]">
                À propos
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-[var(--border)]">
          <div className="mx-auto w-full max-w-5xl px-6 py-6 text-xs text-[var(--muted)]">
            Data Blizzard © Blizzard Entertainment · Pas de pub, pas de tracking. Juste de la data.
          </div>
        </footer>
      </body>
    </html>
  );
}
