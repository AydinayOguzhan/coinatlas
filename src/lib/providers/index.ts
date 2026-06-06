import { getEnv } from "@/lib/env";
import { GeminiVisionProvider } from "@/lib/providers/google-gemini";
import { NumistaCatalogProvider } from "@/lib/providers/numista";
import type { AiVisionProvider, CatalogProvider, CatalogCategory } from "@/lib/providers/types";

class NullVisionProvider implements AiVisionProvider {
  async analyzeCoinImage() {
    return {
      country: undefined,
      denomination: undefined,
      year: undefined,
      visibleText: [],
      extractedText: "",
      description: undefined,
      suggestedSearchQuery: ""
    };
  }
}

class NullCatalogProvider implements CatalogProvider {
  async searchCoins(
    _query: string,
    _options?: { category?: CatalogCategory; page?: number; count?: number }
  ) {
    return {
      items: [],
      totalCount: 0,
      page: 1,
      perPage: 50
    };
  }

  async getCoinDetails(id: string) {
    return {
      provider: "manual",
      providerId: id,
      title: "Manual entry"
    };
  }
}

export function getVisionProvider() {
  const env = getEnv();
  if (env.aiProvider === "gemini" && env.googleApiKey) {
    return new GeminiVisionProvider();
  }

  return new NullVisionProvider();
}

export function getCatalogProvider() {
  const env = getEnv();
  if (env.numistaApiKey) {
    return new NumistaCatalogProvider();
  }

  return new NullCatalogProvider();
}
