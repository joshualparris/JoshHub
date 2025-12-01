import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { GlobalSearch } from "@/components/global-search";
import { ThemeInitializer } from "@/components/theme-toggle";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-50 text-neutral-900`}
      >
        <ThemeInitializer />
        <div className="min-h-screen">
          <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">JoshHub</span>
                <span className="text-xs text-neutral-500">home dashboard</span>
              </div>
              <nav className="flex flex-wrap items-center gap-4 text-sm">
                <Link className="hover:underline" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="hover:underline" href="/apps">
                  Apps
                </Link>
                <Link className="hover:underline" href="/projects">
                  Projects
                </Link>
                <Link className="hover:underline" href="/map">
                  Everything Map
                </Link>
                <Link className="hover:underline" href="/life">
                  Life
                </Link>
                <Link className="hover:underline" href="/capture">
                  Capture
                </Link>
                <Link className="hover:underline" href="/notes">
                  Notes
                </Link>
                <Link className="hover:underline" href="/tasks">
                  Tasks
                </Link>
                <Link className="hover:underline" href="/routines">
                  Routines
                </Link>
              </nav>
              <GlobalSearch />
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
