import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions";
import { getAdminSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coins", label: "Coins" },
  { href: "/identify", label: "Identify" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" }
];

export async function AppShell({
  children,
  currentPath
}: {
  children: ReactNode;
  currentPath?: string;
}) {
  const session = await getAdminSession();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-[2rem] border border-white/60 bg-white/70 px-5 py-5 shadow-card backdrop-blur sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-moss">CoinAtlas</p>
            <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
              A self-hosted coin collection assistant.
            </h1>
            <p className="max-w-2xl text-sm text-ink/72 sm:text-base">
              Catalog your collection, upload coin photos, search locally, and use OCR plus Numista data as a guided assistant.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/identify"
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-moss"
            >
              Quick identify
            </Link>
            {session ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-line/80 bg-paper/70 px-5 py-3 text-sm font-semibold text-ink hover:bg-white"
                >
                  Log out
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium",
                currentPath === item.href ? "bg-accent text-white" : "bg-paper/70 text-ink hover:bg-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
