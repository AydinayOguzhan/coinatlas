import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/cards";
import { PublicShell } from "@/components/public-shell";
import { getPublishedCoinById } from "@/lib/data";
import { getPublicUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function PublicCoinDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coin = await getPublishedCoinById(Number(id));

  if (!coin) {
    notFound();
  }

  const metadata = [
    ["Country", coin.country],
    ["Issuer", coin.issuer],
    ["Denomination", coin.denomination],
    ["Currency", coin.currency],
    ["Year", coin.year],
    ["Year range", [coin.minYear, coin.maxYear].filter(Boolean).join(" - ") || null],
    ["Composition", coin.composition],
    ["Weight", coin.weight ? `${coin.weight} g` : null],
    ["Diameter", coin.diameter ? `${coin.diameter} mm` : null],
    ["Thickness", coin.thickness ? `${coin.thickness} mm` : null],
    ["Shape", coin.shape],
    ["Edge", coin.edge]
  ];

  return (
    <PublicShell>
      <nav className="mb-8">
        <Link href="/" className="text-sm font-semibold text-primary transition hover:-translate-x-1 hover:text-primary-container">
          Back to showcase
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.24em] text-primary/70">{coin.country ?? "Published specimen"}</span>
              <h1 className="mt-2 font-display text-5xl leading-none text-ink">{coin.title}</h1>
              <p className="mt-4 text-lg leading-7 text-ink/72">
                {[coin.denomination, coin.year, coin.composition].filter(Boolean).join(" • ") || "Publicly showcased from the private CoinAtlas archive."}
              </p>
            </div>
            {coin.sourceUrl ? (
              <Link href={coin.sourceUrl} target="_blank" className="rounded-lg border border-line/70 bg-[#f2efe9] px-4 py-2 text-sm font-semibold text-ink">
                Source link
              </Link>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {coin.images.length === 0 ? (
              <div className="parchment-card rounded-xl p-6 text-sm text-ink/70">No public images available for this coin yet.</div>
            ) : null}
            {coin.images.map((image) => (
              <div key={image.id} className="parchment-card rounded-xl p-4">
                <div className="relative h-80 overflow-hidden rounded-lg bg-[#fcf9f8]">
                  <Image
                    src={getPublicUploadPath(image.filePath)}
                    alt={`${coin.title} ${image.side}`}
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                </div>
                <p className="mt-3 text-center text-xs uppercase tracking-[0.22em] text-ink/55">{image.side}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <SectionCard title="Technical specifications" description="Safe metadata only. Private collection notes remain in the admin archive.">
            <dl className="space-y-3">
              {metadata.map(([label, value]) =>
                value ? (
                  <div key={label} className="ledger-row flex justify-between gap-3 py-3 text-sm">
                    <dt className="font-semibold text-ink/72">{label}</dt>
                    <dd className="max-w-[60%] text-right text-ink">{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </SectionCard>

          <SectionCard title="Curated descriptions" description="Narrative details visible to public viewers.">
            <div className="space-y-5 text-sm leading-7 text-ink/78">
              <p>
                <strong>Obverse:</strong> {coin.obverseDescription ?? "Not set"}
              </p>
              <p>
                <strong>Reverse:</strong> {coin.reverseDescription ?? "Not set"}
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </PublicShell>
  );
}
