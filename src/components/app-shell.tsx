import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions";
import { getAdminSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coins", label: "Collection" },
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/25 bg-[#fcf9f8]/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div>
            <p className="font-display text-3xl text-primary">CoinAtlas</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink/45">Private Archive</p>
          </div>
          {session ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-line/80 bg-[#f2efe9] px-4 py-2 text-sm font-semibold text-ink"
              >
                Logout
              </button>
            </form>
          ) : null}
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition",
                currentPath === item.href ? "bg-[#e6c093] text-ink shadow-panel" : "bg-[#f2efe9] text-ink/72"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-[1280px]">
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-line/25 bg-[#f6f3f0] px-4 py-8 lg:flex lg:flex-col">
          <div className="mb-10 px-2">
            <p className="font-display text-3xl text-primary">CoinAtlas</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-ink/45">Private Archive</p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition",
                  currentPath === item.href
                    ? "translate-x-1 bg-[#e6c093] text-ink shadow-panel"
                    : "text-ink/68 hover:bg-[#ece5db] hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 border-t border-line/30 px-2 pt-6">
            <Link href="/" className="block text-sm font-medium text-ink/62 transition hover:text-primary">
              Public showcase
            </Link>
            {session ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-lg border border-line/70 bg-white px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-[#f2efe9]"
                >
                  Logout
                </button>
              </form>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 pb-14 pt-8 sm:px-6 lg:px-10">
          <div className="mb-8 hidden items-end justify-between gap-6 lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-moss">Collector workspace</p>
              <h1 className="mt-2 font-display text-5xl leading-none text-ink">A private ledger for your collection.</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">
                Catalog acquisitions, compare potential matches, and decide what enters the public showcase without exposing the rest of your archive.
              </p>
            </div>
            <Link
              href="/identify"
              className="inline-flex items-center justify-center rounded-lg bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink shadow-panel transition hover:bg-[#d8b382]"
            >
              Quick identify
            </Link>
          </div>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
