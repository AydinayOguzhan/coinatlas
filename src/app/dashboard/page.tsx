import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SectionCard, StatCard } from "@/components/cards";
import { requireAdminSession } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireAdminSession();
  const stats = await getDashboardStats();

  return (
    <AppShell currentPath="/dashboard">
      <header className="mb-10 flex flex-col gap-6 border-b border-line/35 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-moss">Vault overview</p>
          <h2 className="mt-2 font-display text-5xl text-ink">Manage the archive with precision.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
            Review collection growth, recent additions, and move directly into identification or curation work.
          </p>
        </div>
        <span className="text-sm uppercase tracking-[0.22em] text-primary/70">Private Admin Surface</span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total coins" value={stats.totalCoins} hint="Includes quantity across your collection." />
          <StatCard label="Unique types" value={stats.totalUniqueTypes} hint="Grouped by title and country for the MVP." />
          <StatCard label="Recent additions" value={stats.recentCoins.length} hint="Latest cataloged items." />
          <SectionCard title="Start identifying" description="Upload coin photos or text clues from your phone and compare guided matches.">
            <Link href="/identify" className="inline-flex rounded-lg bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink">
              Open identify flow
            </Link>
          </SectionCard>
        </div>

        <SectionCard title="Recent additions" description="Your latest records, ready for review or publication.">
          <div className="space-y-3">
            {stats.recentCoins.length === 0 ? (
              <p className="text-sm leading-7 text-ink/70">No coins added yet. Start with manual entry or the identify flow.</p>
            ) : null}
            {stats.recentCoins.map((coin) => (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className="block rounded-lg border border-line/55 bg-[#fcf9f4] p-4 transition hover:border-primary/30 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl text-ink">{coin.title}</h3>
                    <p className="mt-1 text-sm text-ink/70">
                      {[coin.country, coin.denomination, coin.year].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-moss">{formatDate(coin.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
