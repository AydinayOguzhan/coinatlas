import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import { getEnv } from "@/lib/env";
import { slugifyFileName } from "@/lib/utils";

function resolveUploadDir() {
  const env = getEnv();
  return path.resolve(process.cwd(), env.uploadDir);
}

function inferExtensionFromMimeType(mimeType: string | null | undefined) {
  if (mimeType === "image/png") {
    return ".png";
  }
  if (mimeType === "image/webp") {
    return ".webp";
  }
  return ".jpg";
}

async function persistBuffer(input: {
  bytes: Buffer;
  originalFileName: string;
  mimeType: string;
}) {
  const uploadDir = resolveUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(input.originalFileName) || inferExtensionFromMimeType(input.mimeType);
  const safeName = slugifyFileName(path.basename(input.originalFileName, extension)) || "upload";
  const storedName = `${Date.now()}-${randomUUID()}-${safeName}${extension.toLowerCase()}`;
  const absolutePath = path.join(uploadDir, storedName);

  if (!absolutePath.startsWith(uploadDir)) {
    throw new Error("Invalid upload path.");
  }

  await writeFile(absolutePath, input.bytes);

  return {
    absolutePath,
    relativePath: path.relative(process.cwd(), absolutePath),
    originalFileName: input.originalFileName,
    mimeType: input.mimeType,
    sizeBytes: input.bytes.length
  };
}

export function getPublicUploadPath(filePath: string) {
  const relativePath = filePath.replace(`${process.cwd()}/`, "");
  return `/api/uploads/${relativePath}`;
}

export async function saveUploadedFile(file: File) {
  const env = getEnv();

  if (!file || file.size === 0) {
    return null;
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type. Please upload JPG, PNG, or WebP.");
  }

  if (file.size > env.maxUploadSizeMb * 1024 * 1024) {
    throw new Error(`File is too large. Maximum size is ${env.maxUploadSizeMb} MB.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  return persistBuffer({
    bytes: Buffer.from(arrayBuffer),
    originalFileName: file.name,
    mimeType: file.type
  });
}

export async function saveRemoteImage(url: string, fallbackName: string) {
  const env = getEnv();
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTPS remote images are supported.");
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to download the imported image.");
  }

  const mimeType = response.headers.get("content-type") ?? "image/jpeg";
  if (!ACCEPTED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error("Imported image has an unsupported file type.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  if (bytes.length > env.maxUploadSizeMb * 1024 * 1024) {
    throw new Error(`Imported image is too large. Maximum size is ${env.maxUploadSizeMb} MB.`);
  }

  const fileName = path.basename(parsedUrl.pathname) || `${fallbackName}${inferExtensionFromMimeType(mimeType)}`;
  return persistBuffer({
    bytes,
    originalFileName: fileName,
    mimeType
  });
}
