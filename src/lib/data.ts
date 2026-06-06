import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { coinImages, coins, identificationSessions } from "@/db/schema";
import type { CatalogCoinDetails, CatalogSearchResult } from "@/lib/providers/types";
import { buildNormalizedQuery, extractUsefulQueryTerms, tryParseJson } from "@/lib/utils";

export async function getDashboardStats() {
  const [coinCount] = await db.select({ value: count() }).from(coins);
  const [uniqueTypeCount] = await db
    .select({ value: sql<number>`count(distinct ${coins.title} || '-' || ${coins.country})` })
    .from(coins);
  const recentCoins = await db.select().from(coins).orderBy(desc(coins.createdAt)).limit(5);

  return {
    totalCoins: coinCount?.value ?? 0,
    totalUniqueTypes: uniqueTypeCount?.value ?? 0,
    recentCoins
  };
}

export async function searchCoinsInCollection(
  query?: string,
  filters?: Record<string, string | undefined>,
  sort?: "createdAt" | "country" | "year"
) {
  const allCoins = await db.query.coins.findMany({
    with: {
      images: true
    }
  });

  const normalizedQuery = buildNormalizedQuery([query]);
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  const filtered = allCoins.filter((coin) => {
    if (filters?.country && !buildNormalizedQuery([coin.country]).includes(buildNormalizedQuery([filters.country]))) {
      return false;
    }
    if (filters?.year && !buildNormalizedQuery([coin.year]).includes(buildNormalizedQuery([filters.year]))) {
      return false;
    }
    if (
      filters?.denomination &&
      !buildNormalizedQuery([coin.denomination]).includes(buildNormalizedQuery([filters.denomination]))
    ) {
      return false;
    }
    if (filters?.condition && !buildNormalizedQuery([coin.condition]).includes(buildNormalizedQuery([filters.condition]))) {
      return false;
    }

    if (queryTerms.length === 0) {
      return true;
    }

    const haystack = buildNormalizedQuery([
      coin.title,
      coin.country,
      coin.issuer,
      coin.denomination,
      coin.currency,
      coin.year,
      coin.notes,
      coin.obverseDescription,
      coin.reverseDescription,
      coin.numistaId,
      ...coin.images.map((image) => image.ocrText ?? ""),
      ...coin.images.map((image) => image.aiDescription ?? "")
    ]);

    const matchedTerms = queryTerms.filter((term) => haystack.includes(term));
    const exactMatch = normalizedQuery.length > 0 && haystack.includes(normalizedQuery);
    const requiredMatches =
      queryTerms.length >= 6 ? 3 :
      queryTerms.length >= 4 ? 2 :
      1;

    return exactMatch || matchedTerms.length >= requiredMatches;
  });

  const scored = filtered.map((coin) => {
    const haystack = buildNormalizedQuery([
      coin.title,
      coin.country,
      coin.issuer,
      coin.denomination,
      coin.currency,
      coin.year,
      coin.notes,
      coin.obverseDescription,
      coin.reverseDescription,
      coin.numistaId,
      ...coin.images.map((image) => image.ocrText ?? ""),
      ...coin.images.map((image) => image.aiDescription ?? "")
    ]);

    const score =
      queryTerms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0) +
      (normalizedQuery.length > 0 && haystack.includes(normalizedQuery) ? 4 : 0);
    return { coin, score };
  });

  scored.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (sort === "country") {
      return (left.coin.country ?? "").localeCompare(right.coin.country ?? "");
    }

    if (sort === "year") {
      return (right.coin.year ?? "").localeCompare(left.coin.year ?? "");
    }

    return (right.coin.createdAt ?? "").localeCompare(left.coin.createdAt ?? "");
  });

  return scored.map(({ coin }) => coin);
}

export async function getCoinById(id: number) {
  const coin = await db.query.coins.findFirst({
    where: eq(coins.id, id),
    with: {
      images: true
    }
  });

  return coin ?? null;
}

export async function createCoin(input: Omit<typeof coins.$inferInsert, "id" | "createdAt" | "updatedAt">) {
  const result = await db
    .insert(coins)
    .values({
      ...input,
      updatedAt: new Date().toISOString()
    })
    .returning({ id: coins.id });

  return result[0]?.id;
}

export async function updateCoin(id: number, input: Partial<typeof coins.$inferInsert>) {
  await db
    .update(coins)
    .set({
      ...input,
      updatedAt: new Date().toISOString()
    })
    .where(eq(coins.id, id));
}

export async function deleteCoin(id: number) {
  await db.delete(coins).where(eq(coins.id, id));
}

export async function addCoinImage(input: typeof coinImages.$inferInsert) {
  await db.insert(coinImages).values(input);
}

export async function deleteCoinImage(imageId: number) {
  await db.delete(coinImages).where(eq(coinImages.id, imageId));
}

export async function deleteCoinImagesBySide(coinId: number, side: "obverse" | "reverse") {
  await db.delete(coinImages).where(sql`${coinImages.coinId} = ${coinId} and ${coinImages.side} = ${side}`);
}

export async function getCoinImages(coinId: number) {
  return db.select().from(coinImages).where(eq(coinImages.coinId, coinId));
}

export async function createIdentificationSession(input: {
  inputType: "text" | "image";
  inputText?: string | null;
  imagePath?: string | null;
  extractedText?: string | null;
  aiSummary?: string | null;
  normalizedQuery?: string | null;
  localResults?: unknown;
  numistaResults?: unknown;
  selectedNumistaId?: string | null;
}) {
  const result = await db
    .insert(identificationSessions)
    .values({
      inputType: input.inputType,
      inputText: input.inputText ?? null,
      imagePath: input.imagePath ?? null,
      extractedText: input.extractedText ?? null,
      aiSummary: input.aiSummary ?? null,
      normalizedQuery: input.normalizedQuery ?? null,
      localResultsJson: input.localResults ? JSON.stringify(input.localResults) : null,
      numistaResultsJson: input.numistaResults ? JSON.stringify(input.numistaResults) : null,
      selectedNumistaId: input.selectedNumistaId ?? null
    })
    .returning({ id: identificationSessions.id });

  return result[0]?.id;
}

export async function getIdentificationSession(id: number) {
  const session = await db.query.identificationSessions.findFirst({
    where: eq(identificationSessions.id, id)
  });

  if (!session) {
    return null;
  }

  return {
    ...session,
    localResults: tryParseJson<unknown[]>(session.localResultsJson),
    numistaResults: tryParseJson<CatalogSearchResult | unknown[]>(session.numistaResultsJson)
  };
}

export function mapCatalogDetailsToCoin(details: CatalogCoinDetails) {
  return {
    numistaId: details.numistaId ?? null,
    title: details.title,
    country: details.country ?? "Unknown",
    issuer: details.issuer ?? null,
    denomination: details.denomination ?? null,
    currency: details.currency ?? null,
    year: details.year ?? null,
    minYear: details.minYear ?? null,
    maxYear: details.maxYear ?? null,
    composition: details.composition ?? null,
    weight: details.weight ?? null,
    diameter: details.diameter ?? null,
    thickness: details.thickness ?? null,
    shape: details.shape ?? null,
    edge: details.edge ?? null,
    obverseDescription: details.obverseDescription ?? null,
    reverseDescription: details.reverseDescription ?? null,
    obverseImageUrl: details.obverseImageUrl ?? null,
    reverseImageUrl: details.reverseImageUrl ?? null,
    sourceUrl: details.sourceUrl ?? null
  };
}

export function buildSearchQueryFromDetails(details: {
  suggestedSearchQuery?: string | null;
  extractedText?: string | null;
  visibleText?: string[] | null;
  year?: string | null;
  denomination?: string | null;
  country?: string | null;
  userHint?: string | null;
}) {
  const canonicalQuery = buildNormalizedQuery([details.suggestedSearchQuery]);
  const structuredQuery = buildNormalizedQuery([
    details.year,
    details.denomination,
    details.country,
    details.userHint
  ]);

  if (canonicalQuery) {
    return buildNormalizedQuery([canonicalQuery, details.userHint]);
  }

  const fallbackTerms = [
    ...extractUsefulQueryTerms(details.extractedText, {
      ignoreWords: extractUsefulQueryTerms(structuredQuery, { maxTerms: 20 }),
      maxTerms: 4
    }),
    ...extractUsefulQueryTerms((details.visibleText ?? []).join(" "), {
      ignoreWords: extractUsefulQueryTerms(structuredQuery, { maxTerms: 20 }),
      maxTerms: 3
    })
  ];

  return buildNormalizedQuery([structuredQuery, fallbackTerms.join(" ")]);
}
