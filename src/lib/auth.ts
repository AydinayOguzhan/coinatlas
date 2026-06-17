import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getEnv } from "@/lib/env";

const SESSION_COOKIE_NAME = "coinatlas_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function createSignature(username: string, expiresAt: string, secret: string) {
  return createHmac("sha256", secret).update(`${username}.${expiresAt}`).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAuthConfigured() {
  const env = getEnv();
  return Boolean(env.adminUsername && env.adminPassword && env.authSecret);
}

export async function createAdminSession(username: string) {
  const env = getEnv();
  if (!env.authSecret) {
    throw new Error("AUTH_SECRET is missing. Add it to your environment before using admin login.");
  }

  const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const signature = createSignature(username, expiresAt, env.authSecret);
  const value = `${username}.${expiresAt}.${signature}`;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAdminSession() {
  const env = getEnv();
  if (!env.adminUsername || !env.adminPassword || !env.authSecret) {
    return null;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return null;
  }

  const [username, expiresAt, signature] = raw.split(".");
  if (!username || !expiresAt || !signature) {
    return null;
  }

  if (username !== env.adminUsername) {
    return null;
  }

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    return null;
  }

  const expected = createSignature(username, expiresAt, env.authSecret);
  if (!safeEqual(signature, expected)) {
    return null;
  }

  return { username };
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}

export function verifyAdminCredentials(username: string, password: string) {
  const env = getEnv();
  if (!env.adminUsername || !env.adminPassword || !env.authSecret) {
    throw new Error("Admin login is not configured yet. Add ADMIN_USERNAME, ADMIN_PASSWORD, and AUTH_SECRET.");
  }

  return safeEqual(username, env.adminUsername) && safeEqual(password, env.adminPassword);
}
