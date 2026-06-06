import Image from "next/image";
import Link from "next/link";

import type { CatalogCandidate } from "@/lib/providers/types";

function confidenceLabel(confidence?: number) {
  if (confidence == null) {
    return "Needs verification";
  }
  if (confidence >= 0.8) {
    return "Likely match";
  }
  if (confidence >= 0.5) {
    return "Possible match";
  }
  return "Needs verification";
}

export function CandidateList({
  title,
  items,
  buildHref,
  showSourceLink = true
}: {
  title: string;
  items: CatalogCandidate[];
  buildHref?: (item: CatalogCandidate) => string;
  showSourceLink?: boolean;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-line bg-paper/70 p-5 text-sm text-ink/70">
            No candidates yet.
          </div>
        ) : null}

        {items.map((item) => (
          <article
            key={`${item.provider}-${item.providerId}`}
            className="grid gap-4 rounded-[1.5rem] border border-line/70 bg-paper/85 p-4 sm:grid-cols-[96px_1fr]"
          >
            <div className="relative h-24 overflow-hidden rounded-2xl bg-white">
              {item.imageUrl ? (
                item.sourceUrl && showSourceLink ? (
                  <Link href={item.sourceUrl} target="_blank" className="block h-full w-full">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  </Link>
                ) : (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-moss">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {item.sourceUrl && showSourceLink ? (
                  <Link href={item.sourceUrl} target="_blank" className="text-lg font-semibold text-ink hover:text-moss">
                    {item.title}
                  </Link>
                ) : (
                  <h4 className="text-lg font-semibold text-ink">{item.title}</h4>
                )}
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-moss">
                  {confidenceLabel(item.confidence)}
                </span>
              </div>
              <p className="text-sm text-ink/75">
                {[item.country, item.denomination, item.yearRange].filter(Boolean).join(" • ") || "Catalog details pending"}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                {item.sourceUrl && showSourceLink ? (
                  <Link href={item.sourceUrl} target="_blank" className="font-medium text-accent hover:underline">
                    Open on Numista
                  </Link>
                ) : null}
                {buildHref ? (
                  <Link href={buildHref(item)} className="font-medium text-ink hover:text-moss">
                    Use this match
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
