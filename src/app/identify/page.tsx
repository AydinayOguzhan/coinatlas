import Link from "next/link";

import { identifyCoinAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { requireAdminSession } from "@/lib/auth";
import { CandidateList } from "@/components/candidate-list";
import { SectionCard } from "@/components/cards";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getIdentificationSession } from "@/lib/data";
import { getEnvHealth } from "@/lib/env";
import { getCatalogProvider } from "@/lib/providers";
import { getPublicUploadPath } from "@/lib/uploads";
import type { CatalogCandidate, CatalogCategory, CatalogSearchResult } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

type LocalResult = {
  id: number;
  title: string;
  country?: string | null;
  denomination?: string | null;
  year?: string | null;
  images?: Array<{
    filePath: string;
  }>;
};

export default async function IdentifyPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const sessionId = typeof params.sessionId === "string" ? Number(params.sessionId) : null;
  const numistaPage = typeof params.page === "string" ? Math.max(1, Number(params.page) || 1) : 1;
  const catalogCategory =
    params.catalogCategory === "coin" || params.catalogCategory === "banknote" || params.catalogCategory === "exonumia"
      ? (params.catalogCategory as CatalogCategory)
      : "coin";
  const error = typeof params.error === "string" ? params.error : null;
  const warning = typeof params.warning === "string" ? params.warning : null;
  const envHealth = getEnvHealth();
  const session = sessionId ? await getIdentificationSession(sessionId) : null;
  const localCandidates =
    ((session?.localResults ?? []) as unknown as LocalResult[]).map((coin) => ({
      provider: "local",
      providerId: String(coin.id),
      title: coin.title,
      country: coin.country ?? undefined,
      denomination: coin.denomination ?? undefined,
      yearRange: coin.year ?? undefined,
      imageUrl: coin.images?.[0]?.filePath ? getPublicUploadPath(coin.images[0].filePath) : undefined,
      confidence: 0.7
    })) ?? [];

  let numistaSearchResult: CatalogSearchResult = {
    items: [],
    totalCount: 0,
    page: numistaPage,
    perPage: 50
  };
  let numistaWarning = warning;
  const storedNumista =
    session?.numistaResults && !Array.isArray(session.numistaResults) && "items" in session.numistaResults
      ? (session.numistaResults as CatalogSearchResult)
      : null;

  if (numistaPage === 1 && storedNumista) {
    numistaSearchResult = storedNumista;
  } else if (session?.normalizedQuery) {
    try {
      const provider = getCatalogProvider();
      numistaSearchResult = await provider.searchCoins(session.normalizedQuery, {
        category: catalogCategory,
        page: numistaPage,
        count: 50
      });
    } catch (pageError) {
      numistaWarning = pageError instanceof Error ? pageError.message : "Numista lookup failed.";
    }
  }

  const totalPages =
    numistaSearchResult.totalCount > 0 ? Math.ceil(numistaSearchResult.totalCount / numistaSearchResult.perPage) : 0;

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (sessionId) {
      search.set("sessionId", String(sessionId));
    }
    search.set("catalogCategory", catalogCategory);
    search.set("page", String(page));
    return `/identify?${search.toString()}`;
  }

  return (
    <AppShell currentPath="/identify">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Identify a coin" description="Upload an image or enter text. OCR and AI only assist; you verify every field.">
          {!envHealth.GOOGLE_API_KEY || !envHealth.NUMISTA_API_KEY ? (
            <div className="mb-4 rounded-2xl border border-line bg-paper/70 px-4 py-3 text-sm text-ink">
              Missing configuration:
              {!envHealth.GOOGLE_API_KEY ? " GOOGLE_API_KEY" : ""}
              {!envHealth.GOOGLE_API_KEY && !envHealth.NUMISTA_API_KEY ? " and" : ""}
              {!envHealth.NUMISTA_API_KEY ? " NUMISTA_API_KEY" : ""}.
              Image OCR needs Google. Numista matches need Numista.
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
              {error}
            </div>
          ) : null}
          {numistaWarning ? (
            <div className="mb-4 rounded-2xl border border-line bg-paper/70 px-4 py-3 text-sm text-ink">
              {numistaWarning}
            </div>
          ) : null}
          <form action={identifyCoinAction} className="space-y-4">
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
            <label className="block space-y-2 text-sm font-medium">
              <span>Object type</span>
              <select name="catalogCategory" defaultValue={catalogCategory}>
                <option value="coin">Coin</option>
                <option value="exonumia">Medal / token</option>
                <option value="banknote">Banknote</option>
              </select>
              <p className="text-xs text-ink/65">
                This filters Numista results. Use `Medal / token` for medals, medallions, and similar exonumia.
              </p>
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Text clues</span>
              <textarea name="textInput" rows={4} placeholder="Example: 5 cents canada 1902 victoria" />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Optional hint</span>
              <input name="userHint" placeholder="Example: bronze, crowned portrait" />
            </label>
            <FormSubmitButton idleLabel="Run identification" pendingLabel="Analyzing coin..." />
          </form>

          {session ? (
            <div className="mt-6 space-y-3 rounded-[1.5rem] border border-line/70 bg-paper/70 p-4 text-sm text-ink/76">
              <p>
                <strong>Normalized query:</strong> {session.normalizedQuery ?? "Not available"}
              </p>
              <p>
                <strong>Extracted text:</strong> {session.extractedText ?? "No OCR text"}
              </p>
              <p>
                <strong>AI summary:</strong> {session.aiSummary ?? "No AI summary"}
              </p>
            </div>
          ) : null}
        </SectionCard>

        <div className="space-y-6">
          <CandidateList title="Already in your collection" items={localCandidates} showSourceLink={false} />
          <CandidateList
            title="Possible Numista matches"
            items={numistaSearchResult.items as CatalogCandidate[]}
            buildHref={(item) => `/coins/new?numistaId=${item.providerId}`}
          />
          {totalPages > 1 ? (
            <SectionCard
              title="Browse Matches"
              description={`Showing page ${numistaSearchResult.page} of ${totalPages} across ${numistaSearchResult.totalCount} Numista matches.`}
            >
              <div className="flex flex-wrap items-center gap-3">
                {numistaSearchResult.page > 1 ? (
                  <Link href={buildPageHref(numistaSearchResult.page - 1)} className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink">
                    Previous
                  </Link>
                ) : null}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => {
                  const startPage = Math.max(1, Math.min(numistaSearchResult.page - 3, Math.max(totalPages - 6, 1)));
                  const pageNumber = startPage + index;
                  if (pageNumber > totalPages) {
                    return null;
                  }

                  return (
                    <Link
                      key={pageNumber}
                      href={buildPageHref(pageNumber)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        pageNumber === numistaSearchResult.page ? "bg-[#e6c093] text-ink" : "bg-paper text-ink"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
                {numistaSearchResult.page < totalPages ? (
                  <Link href={buildPageHref(numistaSearchResult.page + 1)} className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink">
                    Next
                  </Link>
                ) : null}
              </div>
            </SectionCard>
          ) : null}
          <SectionCard title="Create manually" description="If nothing matches, start from a blank editable form.">
            <Link href="/coins/new" className="text-sm font-semibold text-accent hover:underline">
              Open manual coin form
            </Link>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
