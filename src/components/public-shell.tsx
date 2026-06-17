import Link from "next/link";
import type { ReactNode } from "react";

export function PublicShell({
  children,
  showLogin = true
}: {
  children: ReactNode;
  showLogin?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(182,104,45,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(68,98,74,0.16),transparent_22%),linear-gradient(180deg,#f6eddc_0%,#f8f3e8_48%,#efe0bc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2rem] border border-white/60 bg-white/75 px-5 py-5 shadow-card backdrop-blur sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-moss">CoinAtlas Showcase</p>
              <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
                A public window into your collection.
              </h1>
              <p className="max-w-2xl text-sm text-ink/72 sm:text-base">
                Browse selected coins, inspect images, and explore catalog details without exposing the private admin workspace.
              </p>
            </div>

            {showLogin ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-moss"
              >
                Login
              </Link>
            ) : null}
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
