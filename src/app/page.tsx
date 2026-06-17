import Image from "next/image";
import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { getAdminSession } from "@/lib/auth";
import { getPublishedCoins } from "@/lib/data";
import { getPublicUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [session, coins] = await Promise.all([getAdminSession(), getPublishedCoins()]);

  return (
    <PublicShell showLogin={!session}>
      <section className="py-8 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="font-display text-5xl leading-none text-ink sm:text-6xl">CoinAtlas</h1>
          <p className="text-2xl italic text-primary/85">A Private Numismatic Archive</p>
          <div className="editorial-divider mx-auto my-6 max-w-md" />
          <p className="text-lg leading-8 text-ink/72">
            A self-hosted collection showcase of historical coins, curated for preservation and study. Discover selected artifacts without exposing the private archive behind them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {session ? (
              <Link href="/dashboard" className="rounded-lg bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink shadow-panel">
                Open Admin Panel
              </Link>
            ) : (
              <Link href="/login" className="rounded-lg bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink shadow-panel">
                Login to Archive
              </Link>
            )}
            <span className="rounded-full border border-line/70 bg-[#f2efe9] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/60">
              {coins.length} Published Coins
            </span>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-line/35 pb-4">
          <div>
            <h2 className="font-display text-4xl text-ink">Curated Highlights</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.24em] text-primary/70">Exhibition 01</p>
          </div>
          <p className="hidden max-w-md text-right text-sm leading-6 text-ink/62 md:block">
            Only coins you explicitly publish appear here. The rest of the collection remains in your private admin ledger.
          </p>
        </div>

        {coins.length === 0 ? (
          <div className="parchment-card rounded-xl p-8 text-center">
            <h3 className="font-display text-3xl text-ink">No public coins yet</h3>
            <p className="mt-3 text-sm leading-7 text-ink/68">
              Publish coins from the admin collection to turn this page into a public-facing exhibition.
            </p>
            <div className="mt-6">
              <Link href="/login" className="rounded-lg bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink shadow-panel">
                Log in to manage showcase items
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {coins.map((coin) => (
              <Link key={coin.id} href={`/collection/${coin.id}`} className="group block">
                <article className="parchment-card rounded-xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card">
                  <div className="relative mb-8 flex justify-center">
                    {coin.year ? (
                      <span className="absolute right-0 top-0 bg-[#fcf9f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                        {coin.country ?? "Unknown"} · {coin.year}
                      </span>
                    ) : null}
                    <div className="relative h-64 w-full overflow-hidden rounded-lg border border-[#d4af37]/35 bg-[#fcf9f8] p-4 shadow-panel">
                      {coin.images[0] ? (
                        <Image
                          src={getPublicUploadPath(coin.images[0].filePath)}
                          alt={coin.title}
                          fill
                          className="object-contain p-4"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-line/70 text-xs uppercase tracking-[0.28em] text-moss">
                          No image
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-3xl leading-tight text-ink transition group-hover:text-primary">{coin.title}</h3>
                    <div className="flex items-center justify-between gap-3 text-sm text-ink/70">
                      <span>{coin.country ?? "Unknown origin"}</span>
                      <span className="italic">{coin.denomination ?? "Catalog specimen"}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
