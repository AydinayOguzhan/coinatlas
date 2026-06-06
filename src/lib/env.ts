function sanitizeSecret(value: string | undefined) {
  const normalized = (value ?? "").trim();
  if (!normalized || normalized === "SET_LOCALLY" || normalized === "REDACTED_LOCAL_VALUE") {
    return "";
  }

  return normalized;
}

const requiredKeys = {
  NUMISTA_API_KEY: sanitizeSecret(process.env.NUMISTA_API_KEY),
  GOOGLE_API_KEY: sanitizeSecret(process.env.GOOGLE_API_KEY)
};

export function getEnv() {
  return {
    databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
    numistaApiKey: requiredKeys.NUMISTA_API_KEY,
    numistaApiBaseUrl: process.env.NUMISTA_API_BASE_URL ?? "https://api.numista.com/v3",
    googleApiKey: requiredKeys.GOOGLE_API_KEY,
    googleOcrProvider: process.env.GOOGLE_OCR_PROVIDER ?? "gemini",
    aiProvider: process.env.AI_PROVIDER ?? "gemini",
    uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
    maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? "10")
  };
}

export function getEnvHealth() {
  const env = getEnv();

  return {
    GOOGLE_API_KEY: Boolean(env.googleApiKey),
    NUMISTA_API_KEY: Boolean(env.numistaApiKey),
    DATABASE_URL: Boolean(env.databaseUrl),
    UPLOAD_DIR: Boolean(env.uploadDir)
  };
}
