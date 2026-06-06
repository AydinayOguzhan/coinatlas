export interface OcrProvider {
  extractTextFromImage(input: {
    imagePath: string;
  }): Promise<{
    text: string;
    confidence?: number;
    raw?: unknown;
  }>;
}

export interface AiVisionProvider {
  analyzeCoinImage(input: {
    imagePath: string;
  }): Promise<{
    country?: string;
    denomination?: string;
    year?: string;
    visibleText?: string[];
    extractedText?: string;
    description?: string;
    suggestedSearchQuery: string;
    raw?: unknown;
  }>;
}

export type CatalogCandidate = {
  provider: "numista" | "manual" | string;
  providerId: string;
  title: string;
  country?: string;
  issuer?: string;
  yearRange?: string;
  denomination?: string;
  imageUrl?: string;
  sourceUrl?: string;
  confidence?: number;
  raw?: unknown;
};

export type CatalogCategory = "coin" | "banknote" | "exonumia";

export type CatalogSearchResult<T = CatalogCandidate> = {
  items: T[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type CatalogCoinDetails = {
  provider: string;
  providerId: string;
  numistaId?: string;
  title: string;
  country?: string;
  issuer?: string;
  denomination?: string;
  currency?: string;
  year?: string;
  minYear?: number;
  maxYear?: number;
  composition?: string;
  weight?: number;
  diameter?: number;
  thickness?: number;
  shape?: string;
  edge?: string;
  obverseDescription?: string;
  reverseDescription?: string;
  imageUrl?: string;
  obverseImageUrl?: string;
  reverseImageUrl?: string;
  sourceUrl?: string;
  raw?: unknown;
};

export interface CatalogProvider {
  searchCoins(
    query: string,
    options?: {
      category?: CatalogCategory;
      page?: number;
      count?: number;
    }
  ): Promise<CatalogSearchResult>;
  getCoinDetails(id: string): Promise<CatalogCoinDetails>;
}
