import Image from "next/image";
import Link from "next/link";

import { toggleCoinPublishAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/cards";
import { PublishToggleForm } from "@/components/publish-toggle-form";
import { requireAdminSession } from "@/lib/auth";
import { searchCoinsInCollection } from "@/lib/data";
import { getPublicUploadPath } from "@/lib/uploads";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CoinsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const country = typeof params.country === "string" ? params.country : "";
  const year = typeof params.year === "string" ? params.year : "";
  const denomination = typeof params.denomination === "string" ? params.denomination : "";
  const condition = typeof params.condition === "string" ? params.condition : "";
  const sort = typeof params.sort === "string" ? params.sort : "createdAt";

  const items = await searchCoinsInCollection(
    query,
    { country, year, denomination, condition },
    sort === "country" || sort === "year" ? sort : "createdAt"
  );

  const formatOptionalText = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") {
      return "Not set";
    }

    return String(value);
  };

  const buildMeta = (coin: (typeof items)[number]) =>
    [
      { label: "Country", value: formatOptionalText(coin.country) },
      { label: "Year", value: formatOptionalText(coin.year) },
      { label: "Denomination", value: formatOptionalText(coin.denomination) },
      { label: "Condition", value: formatOptionalText(coin.condition) },
      { label: "Quantity", value: String(coin.quantity) },
      { label: "Added", value: formatDate(coin.createdAt) }
    ];

  return (
    <AppShell currentPath="/coins">
      <div className="space-y-6">
        <SectionCard title="Collection" description="Search, filter, and sort your personal catalog.">
          <form className="grid gap-4 lg:grid-cols-6">
            <input name="q" placeholder="Search text" defaultValue={query} className="lg:col-span-2" />
            <input name="country" placeholder="Country" defaultValue={country} />
            <input name="year" placeholder="Year" defaultValue={year} />
            <input name="denomination" placeholder="Denomination" defaultValue={denomination} />
            <input name="condition" placeholder="Condition" defaultValue={condition} />
            <select name="sort" defaultValue={sort}>
              <option value="createdAt">Newest first</option>
              <option value="country">Country</option>
              <option value="year">Year</option>
            </select>
            <div className="flex gap-3 lg:col-span-6">
              <button type="submit" className="rounded-full bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink">
                Apply filters
              </button>
              <Link href="/coins/new" className="rounded-full bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink">
                Add coin
              </Link>
            </div>
          </form>
        </SectionCard>

        <div className="grid gap-5">
          {items.length === 0 ? (
            <SectionCard title="No results" description="Try broadening your search or add your first coin manually.">
              <Link href="/coins/new" className="text-sm font-semibold text-accent hover:underline">
                Create a manual coin entry
              </Link>
            </SectionCard>
          ) : null}

          {items.map((coin) => (
            <article
              key={coin.id}
              className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_18px_50px_rgba(122,82,43,0.14)]"
            >
              <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
                <div className="relative min-h-[220px] border-b border-line/60 bg-[radial-gradient(circle_at_top,_rgba(182,104,45,0.16),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,243,232,0.95))] p-6 lg:min-h-full lg:border-b-0 lg:border-r">
                  <Link href={`/coins/${coin.id}`} className="absolute inset-0 block">
                    {coin.images[0] ? (
                      <Image
                        src={getPublicUploadPath(coin.images[0].filePath)}
                        alt={coin.title}
                        fill
                        className="object-contain p-5"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full min-h-[180px] items-center justify-center rounded-[1.5rem] border border-dashed border-line/80 bg-white/70 text-xs uppercase tracking-[0.28em] text-moss">
                        No image yet
                      </div>
                    )}
                  </Link>
                  <div className="pointer-events-none absolute inset-x-6 bottom-5 hidden rounded-full bg-[#f2efe9]/95 px-4 py-2 text-xs uppercase tracking-[0.22em] text-ink sm:block">
                    {coin.images.length > 0 ? `${coin.images.length} image${coin.images.length > 1 ? "s" : ""}` : "Photo slot ready"}
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {coin.country ? (
                            <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                              {coin.country}
                            </span>
                          ) : null}
                          {coin.denomination ? (
                            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                              {coin.denomination}
                            </span>
                          ) : null}
                          {coin.year ? (
                            <span className="rounded-full bg-ink/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">
                              {coin.year}
                            </span>
                          ) : null}
                        </div>

                        <div>
                          <Link href={`/coins/${coin.id}`} className="hover:text-moss">
                            <h2 className="font-display text-3xl leading-tight text-ink">{coin.title}</h2>
                          </Link>
                          <p className="mt-2 max-w-2xl text-sm text-ink/68">
                            {[coin.issuer, coin.currency, coin.storageLocation].filter(Boolean).join(" • ") || "Open the record to review images, notes, source links, and edit this entry."}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 rounded-[1.4rem] border border-line/70 bg-paper/70 px-4 py-3 text-right">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-moss">Collection status</p>
                        <p className="mt-2 text-sm font-semibold text-ink">
                          {coin.condition ? `${coin.condition} condition` : "Condition not set"}
                        </p>
                        <p className="mt-1 text-xs text-ink/65">Added {formatDate(coin.createdAt)}</p>
                        <p
                          className={`mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            coin.isPublished ? "bg-[#d3e8d5] text-ink" : "bg-white text-ink/75"
                          }`}
                        >
                          {coin.isPublished ? "Published" : "Private"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-line/60 bg-white/60 px-4 py-3">
                      <PublishToggleForm
                        action={toggleCoinPublishAction.bind(null, coin.id, !coin.isPublished)}
                        isPublished={coin.isPublished}
                      />
                      <p className="text-sm text-ink/62">Choose whether this coin appears on the public pages.</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {buildMeta(coin).map((entry) => (
                        <div
                          key={`${coin.id}-${entry.label}`}
                          className={cn(
                            "rounded-[1.35rem] border border-line/65 bg-paper/70 px-4 py-3",
                            entry.value === "Not set" ? "text-ink/55" : "text-ink"
                          )}
                        >
                          <p className="text-[11px] uppercase tracking-[0.2em] text-moss">{entry.label}</p>
                          <p className="mt-2 text-sm font-semibold">{entry.value}</p>
                        </div>
                      ))}
                    </div>

                    {coin.notes ? (
                      <div className="rounded-[1.5rem] border border-accent/12 bg-accent/5 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Notes</p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/72">{coin.notes}</p>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-1">
                      <p className="text-sm text-ink/60">Open this record to edit details and images.</p>
                      <Link href={`/coins/${coin.id}`} className="rounded-full bg-[#e6c093] px-4 py-2 text-sm font-semibold text-ink">
                        View coin
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
