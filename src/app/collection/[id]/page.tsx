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
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title={coin.title} description={[coin.country, coin.denomination, coin.year].filter(Boolean).join(" • ")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {coin.images.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-line bg-paper/70 p-5 text-sm text-ink/70">
                No public images available for this coin yet.
              </div>
            ) : null}
            {coin.images.map((image) => (
              <div key={image.id} className="space-y-3">
                <div className="relative h-80 overflow-hidden rounded-[1.5rem] bg-white">
                  <Image
                    src={getPublicUploadPath(image.filePath)}
                    alt={`${coin.title} ${image.side}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-sm capitalize text-ink/70">{image.side}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
              Back to showcase
            </Link>
            {coin.sourceUrl ? (
              <Link href={coin.sourceUrl} target="_blank" className="rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink">
                Open source link
              </Link>
            ) : null}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Public metadata" description="Safe fields only. Private collection notes stay in the admin panel.">
            <dl className="grid gap-3">
              {metadata.map(([label, value]) =>
                value ? (
                  <div key={label} className="flex justify-between gap-3 border-b border-line/70 pb-3 text-sm">
                    <dt className="font-semibold text-ink">{label}</dt>
                    <dd className="max-w-[60%] text-right text-ink/72">{value}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </SectionCard>

          <SectionCard title="Descriptions" description="Curated descriptions visible on the public showcase.">
            <div className="space-y-4 text-sm text-ink/78">
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
