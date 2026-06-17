import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/cards";
import { requireAdminSession } from "@/lib/auth";
import { getCoinById } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { getPublicUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export default async function CoinDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const coin = await getCoinById(Number(id));

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
    ["Edge", coin.edge],
    ["Quantity", String(coin.quantity)],
    ["Public status", coin.isPublished ? "Published" : "Private"],
    ["Condition", coin.condition],
    ["Storage", coin.storageLocation],
    ["Acquired", coin.acquisitionDate],
    ["Acquisition price", coin.acquisitionPrice ? String(coin.acquisitionPrice) : null],
    ["Numista ID", coin.numistaId]
  ];

  return (
    <AppShell currentPath="/coins">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title={coin.title} description={[coin.country, coin.denomination, coin.year].filter(Boolean).join(" • ")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {coin.images.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-line bg-paper/70 p-5 text-sm text-ink/70">
                No images uploaded yet.
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
                <p className="text-sm text-ink/70">{image.side}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/coins/${coin.id}/edit`} className="rounded-full bg-[#e6c093] px-5 py-3 text-sm font-semibold text-ink">
              Edit coin
            </Link>
            <Link href="/coins" className="rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink">
              Back to collection
            </Link>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Metadata" description={`Added ${formatDate(coin.createdAt)}`}>
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

          <SectionCard title="Descriptions" description="Imported and manual notes remain fully editable.">
            <div className="space-y-4 text-sm text-ink/78">
              <p>
                <strong>Obverse:</strong> {coin.obverseDescription ?? "Not set"}
              </p>
              <p>
                <strong>Reverse:</strong> {coin.reverseDescription ?? "Not set"}
              </p>
              <p>
                <strong>Notes:</strong> {coin.notes ?? "No notes"}
              </p>
              {coin.sourceUrl ? (
                <Link href={coin.sourceUrl} target="_blank" className="font-semibold text-accent hover:underline">
                  Open source link
                </Link>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
