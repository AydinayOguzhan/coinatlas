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
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/30 bg-[#fcf9f8]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-3xl text-primary">
              CoinAtlas
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.32em] text-ink/45 md:inline">
              Private Numismatic Archive
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm font-medium text-ink/65 transition hover:text-primary md:inline">
              Showcase
            </Link>
            {showLogin ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-[#e6c093] px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#d8b382]"
              >
                Login
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
