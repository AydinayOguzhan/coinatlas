import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toNullableNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

export function slugifyFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

export function buildNormalizedQuery(parts: Array<string | null | undefined>) {
  const joined = parts
    .flatMap((part) => (part ?? "").split(/\s+/))
    .map((part) =>
      part
        .trim()
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/(?<=\d),(?=\d)/g, "")
        .replace(/[^\p{L}\p{N}()./\-]+/gu, " ")
        .toLowerCase()
    )
    .filter(Boolean);

  return Array.from(new Set(joined)).join(" ");
}

const GENERIC_COIN_WORDS = new Set([
  "a",
  "an",
  "and",
  "de",
  "des",
  "der",
  "die",
  "el",
  "et",
  "for",
  "god",
  "in",
  "jahrestag",
  "liberty",
  "mai",
  "of",
  "over",
  "the",
  "trust",
  "uber",
  "und",
  "une",
  "we"
]);

export function extractUsefulQueryTerms(
  text: string | null | undefined,
  options?: {
    ignoreWords?: string[];
    maxTerms?: number;
  }
) {
  const ignoreWords = new Set([...(options?.ignoreWords ?? []), ...GENERIC_COIN_WORDS]);
  const maxTerms = options?.maxTerms ?? 6;

  const terms = (text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((term) => term.trim())
    .filter((term) => {
      if (!term) {
        return false;
      }

      if (ignoreWords.has(term)) {
        return false;
      }

      if (/^\d{4}$/.test(term)) {
        return true;
      }

      return term.length >= 3;
    });

  return Array.from(new Set(terms)).slice(0, maxTerms);
}

export function tryParseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
