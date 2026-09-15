import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { GlobalSearch } from "@/components/global-search";
import { ThemeInitializer, ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/apps", label: "Apps" },
  { href: "/projects", label: "Projects" },
  { href: "/life", label: "Life" },
];

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JoshHub",
  description: "Personal dashboard for Josh's apps, games, and life links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground`}>
        <ThemeInitializer />
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-30">
            <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
            <div className="absolute right-[-80px] top-10 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />
            <div className="absolute bottom-[-120px] left-10 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />
          </div>

          <header className="sticky top-0 z-20 border-b border-white/40 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[auto_1fr_auto]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                  <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                    JoshHub
                  </span>
                  <span className="hidden text-xs uppercase tracking-[0.14em] text-neutral-500 dark:text-slate-300 sm:inline">
                    living os
                  </span>
                </div>
                <div className="hidden items-center gap-2 text-xs text-neutral-600 dark:text-slate-300 lg:flex">
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-200">
                    Faith first
                  </span>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-800/60 dark:bg-blue-900/30 dark:text-blue-200">
                    Family steady
                  </span>
                </div>
              </div>

              <nav className="order-3 col-span-2 flex gap-2 overflow-x-auto pb-1 text-sm md:order-none md:col-span-1 md:justify-center md:overflow-visible md:pb-0">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    className="shrink-0 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center justify-end gap-2">
                <GlobalSearch />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
              {children}
            </div>
          </main>
        </div>
        <script
          src="/podcast-dock.js"
          data-topics="it,software,research,faith,relationships,career,decision,homelab,horses"
          data-default-topic="faith"
          defer
        />
      </body>
    </html>
  );
}
