import { readFile } from "node:fs/promises";
import path from "node:path";

import { getEnv } from "@/lib/env";
import type { AiVisionProvider } from "@/lib/providers/types";
import { buildNormalizedQuery } from "@/lib/utils";

type GeminiJsonResponse = {
  country?: string;
  denomination?: string;
  year?: string;
  visibleText?: string[];
  description?: string;
  suggestedSearchQuery?: string;
  extractedText?: string;
  confidence?: number;
};

function getMimeType(imagePath: string) {
  const extension = path.extname(imagePath).toLowerCase();
  if (extension === ".png") {
    return "image/png";
  }
  if (extension === ".webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

function formatGeminiError(status: number, payload: unknown) {
  const message =
    typeof payload === "object" && payload && "error" in payload
      ? (payload as { error?: { message?: string } }).error?.message
      : undefined;

  if (status === 400) {
    return message ?? "Gemini request was rejected. Check the image format and request payload.";
  }
  if (status === 401 || status === 403) {
    return "Gemini request was denied. Check whether GOOGLE_API_KEY is valid and enabled for the Gemini API.";
  }
  if (status === 429) {
    return "Gemini quota was exceeded or rate-limited. Please try again later.";
  }

  return message ?? "Gemini provider request failed.";
}

async function callGemini(prompt: string, imagePath: string) {
  const env = getEnv();
  if (!env.googleApiKey) {
    throw new Error("Google API key is missing. Set GOOGLE_API_KEY in your environment.");
  }

  const imageBytes = await readFile(imagePath);
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": env.googleApiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: getMimeType(imagePath),
                  data: imageBytes.toString("base64")
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(async () => await response.text());
    throw new Error(formatGeminiError(response.status, payload));
  }

  const raw = await response.json();
  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini provider returned an empty response.");
  }

  let parsed: GeminiJsonResponse;
  try {
    parsed = JSON.parse(text) as GeminiJsonResponse;
  } catch {
    throw new Error("Gemini provider returned a non-JSON response.");
  }

  return {
    raw,
    parsed
  };
}

export class GeminiVisionProvider implements AiVisionProvider {
  async analyzeCoinImage(input: { imagePath: string }) {
    const { parsed, raw } = await callGemini(
      [
        "Analyze this coin or numismatic object for catalog identification support.",
        "Extract visible text exactly as seen into extractedText.",
        "Translate non-English inscriptions into English only when forming metadata and search terms.",
        "country must be the English country name if known.",
        "denomination must be normalized for catalog search in English if known.",
        "year should be the most relevant visible year or year range marker if known.",
        "description should be a short English summary.",
        "suggestedSearchQuery must be a short English Numista-style catalog query, not a raw OCR dump.",
        "Do not include long inscriptions unless they are essential for identification.",
        "Prefer country + denomination + year + commemorative theme/object type.",
        "Fix OCR noise, broken words, and non-English text when building suggestedSearchQuery.",
        "Examples of good suggestedSearchQuery values: 'turkey 1998 5000000 lira 75th anniversary', 'germany 1970 medal victory over national socialism', 'united states 1964 kennedy half dollar'.",
        "Return JSON only in this shape:",
        '{"country":"string","denomination":"string","year":"string","visibleText":["string"],"extractedText":"string","description":"string","suggestedSearchQuery":"string"}'
      ].join(" "),
      input.imagePath
    );

    return {
      country: parsed.country,
      denomination: parsed.denomination,
      year: parsed.year,
      visibleText: parsed.visibleText ?? [],
      extractedText: parsed.extractedText,
      description: parsed.description,
      suggestedSearchQuery:
        parsed.suggestedSearchQuery ??
        buildNormalizedQuery([
          parsed.extractedText,
          parsed.country,
          parsed.denomination,
          parsed.year,
          ...(parsed.visibleText ?? [])
        ]),
      raw
    };
  }
}
