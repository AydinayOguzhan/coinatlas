import Image from "next/image";
import Link from "next/link";

import { imageSearchAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/cards";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getIdentificationSession, searchCoinsInCollection } from "@/lib/data";
import { getPublicUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

type SearchResult = {
  id: number;
  title: string;
  country?: string | null;
  denomination?: string | null;
  year?: string | null;
  condition?: string | null;
  images?: Array<{
    id?: number;
    filePath: string;
  }>;
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const sessionId = typeof params.sessionId === "string" ? Number(params.sessionId) : null;
  const error = typeof params.error === "string" ? params.error : null;
  const session = sessionId ? await getIdentificationSession(sessionId) : null;
  const results = session
    ? ((session.localResults ?? []) as unknown as SearchResult[])
    : query
      ? await searchCoinsInCollection(query)
      : [];

  return (
    <AppShell currentPath="/search">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Search your collection" description="Use text alone or upload a coin photo to extract searchable text.">
          {error ? (
            <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
              {error}
            </div>
          ) : null}
          <form action={imageSearchAction} className="space-y-4">
            <label className="block space-y-2 text-sm font-medium">
              <span>Text query</span>
              <input name="query" placeholder="Country, year, denomination, notes" defaultValue={query} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium">
                <span>Obverse image</span>
                <input name="obverseImage" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>Reverse image</span>
                <input name="reverseImage" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>
            </div>
            <FormSubmitButton idleLabel="Search collection" pendingLabel="Searching collection..." />
          </form>

          {session ? (
            <div className="mt-6 rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 text-sm text-ink/75">
              <p>
                <strong>OCR text:</strong> {session.extractedText ?? "No OCR text"}
              </p>
              <p className="mt-2">
                <strong>Normalized query:</strong> {session.normalizedQuery ?? "No query"}
              </p>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Search results" description="The MVP uses SQLite LIKE search across major catalog fields.">
          <div className="space-y-3">
            {results.length === 0 ? <p className="text-sm text-ink/70">No local matches found yet.</p> : null}
            {results.map((coin) => (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className="block rounded-[1.5rem] border border-line/70 bg-paper/75 p-4 transition hover:border-accent/30 hover:bg-white"
              >
                <div className="grid gap-4 sm:grid-cols-[112px_1fr] sm:items-center">
                  <div className="relative h-28 overflow-hidden rounded-2xl border border-line/60 bg-white">
                    {coin.images?.[0] ? (
                      <Image
                        src={getPublicUploadPath(coin.images[0].filePath)}
                        alt={coin.title}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-moss">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{coin.title}</h3>
                    <p className="mt-1 text-sm text-ink/72">
                      {[coin.country, coin.denomination, coin.year, coin.condition].filter(Boolean).join(" • ")}
                    </p>
                    <p className="mt-3 text-sm font-medium text-accent">Open coin record</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
