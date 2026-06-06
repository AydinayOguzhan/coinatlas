import { getEnv } from "@/lib/env";
import type {
  CatalogCandidate,
  CatalogCategory,
  CatalogCoinDetails,
  CatalogProvider,
  CatalogSearchResult
} from "@/lib/providers/types";

type NumistaType = {
  id: number;
  title: string;
  min_year?: number;
  max_year?: number;
  issuer?: {
    code?: string;
    name?: string;
  };
  obverse_thumbnail?: string;
  reverse_thumbnail?: string;
  url?: string;
  currency?: {
    name?: string;
  };
  value?: {
    text?: string;
    name?: string;
    face_value?: string;
  } | string;
};

function buildNumistaUrl(id: number | string, url?: string) {
  return url ?? `https://numista.com/${id}`;
}

function readImageUrl(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value) {
    const candidate = value as Record<string, unknown>;
    for (const key of ["photo", "image", "url", "thumbnail"]) {
      if (typeof candidate[key] === "string") {
        return candidate[key] as string;
      }
    }
  }

  return undefined;
}

function formatNumistaValue(value: NumistaType["value"], currency?: { name?: string }) {
  if (!value) {
    return currency?.name;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.text ?? value.name ?? value.face_value ?? currency?.name;
}

export class NumistaCatalogProvider implements CatalogProvider {
  private baseUrl = getEnv().numistaApiBaseUrl;
  private apiKey = getEnv().numistaApiKey;

  private async request<T>(pathname: string, searchParams?: URLSearchParams) {
    if (!this.apiKey) {
      throw new Error("Numista API key is missing. Set NUMISTA_API_KEY in your environment.");
    }

    const normalizedPath = pathname.replace(/^\/+/, "");
    const url = new URL(normalizedPath, this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`);
    if (searchParams) {
      url.search = searchParams.toString();
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Numista-API-Key": this.apiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      const payload = await response.json().catch(async () => await response.text());
      const detail =
        typeof payload === "object" && payload && "message" in payload
          ? String((payload as { message?: string }).message)
          : typeof payload === "string"
            ? payload
            : "";

      if (response.status === 401) {
        throw new Error("Numista rejected the API key. Please verify NUMISTA_API_KEY.");
      }
      if (response.status === 429) {
        throw new Error("Numista rate limit or monthly quota was reached.");
      }

      throw new Error(detail || `Numista request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  }

  async searchCoins(
    query: string,
    options?: { category?: CatalogCategory; page?: number; count?: number }
  ): Promise<CatalogSearchResult> {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const count = Math.min(options?.count && options.count > 0 ? options.count : 50, 50);

    const searchParams = new URLSearchParams({
      q: query,
      count: String(count),
      page: String(page),
      lang: "en"
    });

    if (options?.category) {
      searchParams.set("category", options.category);
    }

    const data = await this.request<{ count: number; types: NumistaType[] }>("types", searchParams);

    return {
      items: (data.types ?? []).map((item) => ({
        provider: "numista",
        providerId: String(item.id),
        title: item.title,
        country: item.issuer?.name,
        issuer: item.issuer?.name,
        yearRange:
          item.min_year && item.max_year && item.min_year !== item.max_year
            ? `${item.min_year}-${item.max_year}`
            : item.min_year
              ? String(item.min_year)
              : undefined,
        denomination: formatNumistaValue(item.value, item.currency),
        imageUrl: item.obverse_thumbnail ?? item.reverse_thumbnail,
        sourceUrl: buildNumistaUrl(item.id, item.url),
        raw: item
      })),
      totalCount: data.count ?? 0,
      page,
      perPage: count
    };
  }

  async getCoinDetails(id: string): Promise<CatalogCoinDetails> {
    const data = await this.request<Record<string, unknown> & NumistaType>(`types/${id}`, new URLSearchParams({ lang: "en" }));
    const composition =
      typeof data.composition === "string"
        ? data.composition
        : typeof data.composition === "object" && data.composition && "name" in data.composition
          ? String((data.composition as { name?: string }).name)
          : undefined;
    const diameter = typeof data.size === "number" ? data.size : undefined;
    const weight = typeof data.weight === "number" ? data.weight : undefined;
    const thickness = typeof data.thickness === "number" ? data.thickness : undefined;
    const edge =
      typeof data.edge === "string"
        ? data.edge
        : typeof data.edge === "object" && data.edge && "description" in data.edge
          ? String((data.edge as { description?: string }).description)
          : undefined;
    const shape = typeof data.shape === "string" ? data.shape : undefined;
    const url = buildNumistaUrl(data.id, typeof data.url === "string" ? data.url : undefined);
    const obverseImageUrl =
      readImageUrl(data.obverse) ?? readImageUrl((data as Record<string, unknown>).obverse_photo) ?? data.obverse_thumbnail;
    const reverseImageUrl =
      readImageUrl(data.reverse) ?? readImageUrl((data as Record<string, unknown>).reverse_photo) ?? data.reverse_thumbnail;
    const obverseDescription =
      typeof data.obverse === "object" && data.obverse && "description" in data.obverse
        ? String((data.obverse as { description?: string }).description)
        : undefined;
    const reverseDescription =
      typeof data.reverse === "object" && data.reverse && "description" in data.reverse
        ? String((data.reverse as { description?: string }).description)
        : undefined;

    return {
      provider: "numista",
      providerId: String(data.id),
      numistaId: String(data.id),
      title: data.title,
      country: data.issuer?.name,
      issuer: data.issuer?.name,
      denomination: formatNumistaValue(data.value, data.currency),
      currency: data.currency?.name,
      minYear: data.min_year,
      maxYear: data.max_year,
      composition,
      weight,
      diameter,
      thickness,
      edge,
      shape,
      obverseDescription,
      reverseDescription,
      imageUrl: obverseImageUrl ?? reverseImageUrl,
      obverseImageUrl,
      reverseImageUrl,
      sourceUrl: url,
      raw: data
    };
  }
}
