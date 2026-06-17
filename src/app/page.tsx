import Image from "next/image";
import Link from "next/link";

import { SectionCard } from "@/components/cards";
import { PublicShell } from "@/components/public-shell";
import { getAdminSession } from "@/lib/auth";
import { getPublishedCoins } from "@/lib/data";
import { getPublicUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [session, coins] = await Promise.all([getAdminSession(), getPublishedCoins()]);

  return (
    <PublicShell showLogin={!session}>
      <div className="space-y-6">
        <SectionCard
          title="Published collection"
          description="Only coins you explicitly publish appear here. The rest of your workspace stays behind the admin login."
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 text-sm text-ink/75">
            <p>{coins.length} published coin{coins.length === 1 ? "" : "s"} currently visible.</p>
            <div className="flex gap-3">
              {session ? (
                <Link href="/dashboard" className="rounded-full bg-ink px-4 py-2 font-semibold text-paper">
                  Open admin panel
                </Link>
              ) : (
                <Link href="/login" className="rounded-full bg-accent px-4 py-2 font-semibold text-white">
                  Login
                </Link>
              )}
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coins.length === 0 ? (
            <SectionCard title="No public coins yet" description="Publish coins from the admin panel to turn this page into a public showcase.">
              <Link href="/login" className="text-sm font-semibold text-accent hover:underline">
                Log in to manage published items
              </Link>
            </SectionCard>
          ) : null}

          {coins.map((coin) => (
            <Link key={coin.id} href={`/collection/${coin.id}`} className="block">
              <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_18px_50px_rgba(122,82,43,0.14)]">
                <div className="relative h-72 border-b border-line/60 bg-[radial-gradient(circle_at_top,_rgba(182,104,45,0.16),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,243,232,0.95))]">
                  {coin.images[0] ? (
                    <Image
                      src={getPublicUploadPath(coin.images[0].filePath)}
                      alt={coin.title}
                      fill
                      className="object-contain p-6"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.28em] text-moss">
                      No image yet
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap gap-2">
                    {coin.country ? (
                      <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                        {coin.country}
                      </span>
                    ) : null}
                    {coin.denomination ? (
                      <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                        {coin.denomination}
                      </span>
                    ) : null}
                    {coin.year ? (
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/72">
                        {coin.year}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="font-display text-3xl leading-tight text-ink">{coin.title}</h2>
                    <p className="mt-2 text-sm text-ink/72">
                      {[coin.composition, coin.shape, coin.edge].filter(Boolean).join(" • ") || "Open the public detail page for more catalog information."}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">
                    View public details
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
