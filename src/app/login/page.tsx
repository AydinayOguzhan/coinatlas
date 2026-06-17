import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions";
import { SectionCard } from "@/components/cards";
import { PublicShell } from "@/components/public-shell";
import { getAdminSession, isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  if (session) {
    redirect("/dashboard");
  }

  const configured = isAuthConfigured();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const nextPath = typeof params.next === "string" ? params.next : "/dashboard";

  return (
    <PublicShell showLogin={false}>
      <div className="mx-auto max-w-xl">
        <SectionCard
          title="Admin login"
          description="Sign in to access your private collection manager, identify flow, exports, and settings."
        >
          {!configured ? (
            <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
              Admin login is not configured yet. Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `AUTH_SECRET` to your environment.
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
              {error}
            </div>
          ) : null}
          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <label className="block space-y-2 text-sm font-medium text-ink">
              <span>Username</span>
              <input name="username" autoComplete="username" />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              <span>Password</span>
              <input name="password" type="password" autoComplete="current-password" />
            </label>
            <button
              type="submit"
              disabled={!configured}
              className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-moss disabled:cursor-not-allowed disabled:opacity-60"
            >
              Log in
            </button>
          </form>
        </SectionCard>
      </div>
    </PublicShell>
  );
}
