import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { SectionCard, StatCard } from "@/components/cards";
import { getDashboardStats } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AppShell currentPath="/dashboard">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total coins" value={stats.totalCoins} hint="Includes quantity across your collection." />
          <StatCard label="Unique types" value={stats.totalUniqueTypes} hint="Grouped by title and country for the MVP." />
          <StatCard label="Recent additions" value={stats.recentCoins.length} hint="Latest cataloged items." />
          <SectionCard title="Start identifying" description="Upload a coin photo or enter text clues from your phone.">
            <Link href="/identify" className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white">
              Open identify flow
            </Link>
          </SectionCard>
        </div>

        <SectionCard title="Recent additions" description="Your latest coins and when they were added.">
          <div className="space-y-3">
            {stats.recentCoins.length === 0 ? (
              <p className="text-sm text-ink/70">No coins added yet. Start with manual entry or the identify flow.</p>
            ) : null}
            {stats.recentCoins.map((coin) => (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className="block rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-ink">{coin.title}</h3>
                    <p className="text-sm text-ink/70">
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
