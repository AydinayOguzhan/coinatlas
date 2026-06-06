"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  addCoinImage,
  buildSearchQueryFromDetails,
  createCoin,
  createIdentificationSession,
  deleteCoinImage,
  deleteCoinImagesBySide,
  deleteCoin,
  searchCoinsInCollection,
  updateCoin
} from "@/lib/data";
import { getCatalogProvider, getVisionProvider } from "@/lib/providers";
import { getEnv } from "@/lib/env";
import type { CatalogCategory } from "@/lib/providers/types";
import { saveRemoteImage, saveUploadedFile } from "@/lib/uploads";
import { buildNormalizedQuery, toNullableNumber, toNullableString } from "@/lib/utils";

function coinInputFromForm(formData: FormData) {
  return {
    numistaId: toNullableString(formData.get("numistaId")),
    title: toNullableString(formData.get("title")) ?? "Untitled coin",
    country: toNullableString(formData.get("country")) ?? "Unknown",
    issuer: toNullableString(formData.get("issuer")),
    denomination: toNullableString(formData.get("denomination")),
    currency: toNullableString(formData.get("currency")),
    year: toNullableString(formData.get("year")),
    minYear: toNullableNumber(formData.get("minYear")),
    maxYear: toNullableNumber(formData.get("maxYear")),
    composition: toNullableString(formData.get("composition")),
    weight: toNullableNumber(formData.get("weight")),
    diameter: toNullableNumber(formData.get("diameter")),
    thickness: toNullableNumber(formData.get("thickness")),
    shape: toNullableString(formData.get("shape")),
    edge: toNullableString(formData.get("edge")),
    obverseDescription: toNullableString(formData.get("obverseDescription")),
    reverseDescription: toNullableString(formData.get("reverseDescription")),
    quantity: toNullableNumber(formData.get("quantity")) ?? 1,
    condition: toNullableString(formData.get("condition")),
    acquisitionDate: toNullableString(formData.get("acquisitionDate")),
    acquisitionPrice: toNullableNumber(formData.get("acquisitionPrice")),
    storageLocation: toNullableString(formData.get("storageLocation")),
    notes: toNullableString(formData.get("notes")),
    sourceUrl: toNullableString(formData.get("sourceUrl"))
  };
}

function toCatalogCategory(value: FormDataEntryValue | null): CatalogCategory | undefined {
  if (value !== "coin" && value !== "banknote" && value !== "exonumia") {
    return undefined;
  }

  return value;
}

async function attachCoinImage(coinId: number, fileValue: FormDataEntryValue | null, side: "obverse" | "reverse") {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return;
  }

  const saved = await saveUploadedFile(fileValue);
  if (!saved) {
    return;
  }

  await addCoinImage({
    coinId,
    side,
    filePath: saved.relativePath,
    originalFileName: saved.originalFileName,
    mimeType: saved.mimeType,
    sizeBytes: saved.sizeBytes
  });
}

async function attachRemoteCoinImage(coinId: number, url: string | null, side: "obverse" | "reverse") {
  if (!url) {
    return;
  }

  const saved = await saveRemoteImage(url, `${side}-imported`);
  await addCoinImage({
    coinId,
    side,
    filePath: saved.relativePath,
    originalFileName: saved.originalFileName,
    mimeType: saved.mimeType,
    sizeBytes: saved.sizeBytes
  });
}

export async function createCoinAction(formData: FormData) {
  const coinId = await createCoin(coinInputFromForm(formData));

  if (!coinId) {
    throw new Error("Failed to create coin.");
  }

  if (formData.get("useImportedObverseImage") === "on") {
    await attachRemoteCoinImage(coinId, toNullableString(formData.get("importedObverseImageUrl")), "obverse");
  }
  if (formData.get("useImportedReverseImage") === "on") {
    await attachRemoteCoinImage(coinId, toNullableString(formData.get("importedReverseImageUrl")), "reverse");
  }
  await attachCoinImage(coinId, formData.get("obverseImage"), "obverse");
  await attachCoinImage(coinId, formData.get("reverseImage"), "reverse");

  revalidatePath("/dashboard");
  revalidatePath("/coins");
  redirect(`/coins/${coinId}`);
}

export async function updateCoinAction(coinId: number, formData: FormData) {
  await updateCoin(coinId, coinInputFromForm(formData));

  for (const value of formData.getAll("removeImageIds")) {
    const imageId = Number(value);
    if (Number.isFinite(imageId)) {
      await deleteCoinImage(imageId);
    }
  }

  if (formData.get("useImportedObverseImage") === "on") {
    await deleteCoinImagesBySide(coinId, "obverse");
    await attachRemoteCoinImage(coinId, toNullableString(formData.get("importedObverseImageUrl")), "obverse");
  }
  if (formData.get("useImportedReverseImage") === "on") {
    await deleteCoinImagesBySide(coinId, "reverse");
    await attachRemoteCoinImage(coinId, toNullableString(formData.get("importedReverseImageUrl")), "reverse");
  }
  if (formData.get("obverseImage") instanceof File && (formData.get("obverseImage") as File).size > 0) {
    await deleteCoinImagesBySide(coinId, "obverse");
  }
  if (formData.get("reverseImage") instanceof File && (formData.get("reverseImage") as File).size > 0) {
    await deleteCoinImagesBySide(coinId, "reverse");
  }
  await attachCoinImage(coinId, formData.get("obverseImage"), "obverse");
  await attachCoinImage(coinId, formData.get("reverseImage"), "reverse");

  revalidatePath(`/coins/${coinId}`);
  revalidatePath("/coins");
  redirect(`/coins/${coinId}`);
}

export async function deleteCoinAction(coinId: number) {
  await deleteCoin(coinId);
  revalidatePath("/dashboard");
  revalidatePath("/coins");
  redirect("/coins");
}

export async function identifyCoinAction(formData: FormData) {
  try {
    const textInput = toNullableString(formData.get("textInput"));
    const userHint = toNullableString(formData.get("userHint"));
    const catalogCategory = toCatalogCategory(formData.get("catalogCategory"));
    const obverseImageFile = formData.get("obverseImage");
    const reverseImageFile = formData.get("reverseImage");
    const env = getEnv();

    const uploadedFiles = [obverseImageFile, reverseImageFile].filter(
      (value): value is File => value instanceof File && value.size > 0
    );

    if ((!textInput || textInput.length === 0) && uploadedFiles.length === 0) {
      throw new Error("Add a coin image or enter text clues before running identification.");
    }

    let extractedText = textInput ?? "";
    let imagePath: string | null = null;
    let aiSummary: string | null = null;
    let normalizedQuery = textInput ?? "";

    if (uploadedFiles.length > 0) {
      if (!env.googleApiKey) {
        throw new Error("Image identification needs a configured Google OCR key. Add GOOGLE_API_KEY in Settings first.");
      }

      const visionProvider = getVisionProvider();
      const extractedTextParts: string[] = [];
      const aiSummaryParts: string[] = [];
      const queryParts: string[] = [];
      const visibleTextParts: string[] = [];
      let detectedYear: string | null = null;
      let detectedDenomination: string | null = null;
      let detectedCountry: string | null = null;

      for (const file of uploadedFiles) {
        const saved = await saveUploadedFile(file);
        if (!saved) {
          throw new Error("Image upload failed.");
        }

        imagePath ??= saved.relativePath;

        const visionResult = await visionProvider.analyzeCoinImage({ imagePath: saved.absolutePath });
        if (visionResult.extractedText) {
          extractedTextParts.push(visionResult.extractedText);
        }
        if (visionResult.description) {
          aiSummaryParts.push(visionResult.description);
        }
        if (visionResult.suggestedSearchQuery) {
          queryParts.push(visionResult.suggestedSearchQuery);
        }
        if (visionResult.visibleText?.length) {
          visibleTextParts.push(...visionResult.visibleText);
        }

        detectedYear ??= visionResult.year ?? null;
        detectedDenomination ??= visionResult.denomination ?? null;
        detectedCountry ??= visionResult.country ?? null;
      }

      extractedText = extractedTextParts.join(" | ");
      aiSummary = aiSummaryParts.join(" ");
      normalizedQuery = buildSearchQueryFromDetails({
        suggestedSearchQuery: queryParts.join(" "),
        extractedText,
        visibleText: visibleTextParts,
        year: detectedYear,
        denomination: detectedDenomination,
        country: detectedCountry,
        userHint
      });
    } else {
      normalizedQuery = buildNormalizedQuery([textInput, userHint]);
    }

    if (!normalizedQuery) {
      throw new Error("No searchable text could be extracted. Add a clearer image or enter a few text clues manually.");
    }

    const localResults = await searchCoinsInCollection(normalizedQuery);
    const catalogProvider = getCatalogProvider();
    let numistaResults: Awaited<ReturnType<typeof catalogProvider.searchCoins>> = {
      items: [],
      totalCount: 0,
      page: 1,
      perPage: 50
    };
    let numistaWarning: string | null = null;

    if (normalizedQuery) {
      try {
        numistaResults = await catalogProvider.searchCoins(normalizedQuery, {
          category: catalogCategory,
          page: 1,
          count: 50
        });
      } catch (error) {
        numistaWarning = error instanceof Error ? error.message : "Numista lookup failed.";
      }
    }

    const sessionId = await createIdentificationSession({
      inputType: imagePath ? "image" : "text",
      inputText: textInput,
      imagePath,
      extractedText,
      aiSummary,
      normalizedQuery,
      localResults,
      numistaResults
    });

    const search = new URLSearchParams({ sessionId: String(sessionId) });
    if (catalogCategory) {
      search.set("catalogCategory", catalogCategory);
    }
    if (numistaWarning) {
      search.set("warning", numistaWarning);
    }

    redirect(`/identify?${search.toString()}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Identification failed.";
    redirect(`/identify?error=${encodeURIComponent(message)}`);
  }
}

export async function imageSearchAction(formData: FormData) {
  try {
    const textInput = toNullableString(formData.get("query"));
    const obverseImageFile = formData.get("obverseImage");
    const reverseImageFile = formData.get("reverseImage");
    const env = getEnv();

    const uploadedFiles = [obverseImageFile, reverseImageFile].filter(
      (value): value is File => value instanceof File && value.size > 0
    );

    if ((!textInput || textInput.length === 0) && uploadedFiles.length === 0) {
      throw new Error("Add a coin image or enter text before searching.");
    }

    let normalizedQuery = buildNormalizedQuery([textInput]);
    let extractedText = textInput ?? "";
    let imagePath: string | null = null;

    if (uploadedFiles.length > 0) {
      if (!env.googleApiKey) {
        throw new Error("Image-assisted search needs a configured Google Gemini key. Add GOOGLE_API_KEY in Settings first.");
      }

      const visionProvider = getVisionProvider();
      const extractedTextParts: string[] = [];
      const queryParts: string[] = [];
      const visibleTextParts: string[] = [];
      let detectedYear: string | null = null;
      let detectedDenomination: string | null = null;
      let detectedCountry: string | null = null;

      for (const file of uploadedFiles) {
        const saved = await saveUploadedFile(file);
        if (!saved) {
          throw new Error("Image upload failed.");
        }

        imagePath ??= saved.relativePath;

        const visionResult = await visionProvider.analyzeCoinImage({ imagePath: saved.absolutePath });
        if (visionResult.extractedText) {
          extractedTextParts.push(visionResult.extractedText);
        }
        if (visionResult.suggestedSearchQuery) {
          queryParts.push(visionResult.suggestedSearchQuery);
        }
        if (visionResult.visibleText?.length) {
          visibleTextParts.push(...visionResult.visibleText);
        }

        detectedYear ??= visionResult.year ?? null;
        detectedDenomination ??= visionResult.denomination ?? null;
        detectedCountry ??= visionResult.country ?? null;
      }

      extractedText = extractedTextParts.join(" | ");
      normalizedQuery = buildSearchQueryFromDetails({
        suggestedSearchQuery: queryParts.join(" "),
        extractedText,
        visibleText: visibleTextParts,
        year: detectedYear,
        denomination: detectedDenomination,
        country: detectedCountry,
        userHint: textInput
      });
    }

    if (!normalizedQuery) {
      throw new Error("No searchable text could be extracted. Add a clearer image or enter a text query.");
    }

    const localResults = await searchCoinsInCollection(normalizedQuery);
    const sessionId = await createIdentificationSession({
      inputType: imagePath ? "image" : "text",
      inputText: textInput,
      imagePath,
      extractedText,
      normalizedQuery,
      localResults,
      numistaResults: []
    });

    redirect(`/search?sessionId=${sessionId}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Search failed.";
    redirect(`/search?error=${encodeURIComponent(message)}`);
  }
}
