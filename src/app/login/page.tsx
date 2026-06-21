import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions";
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
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl text-primary">CoinAtlas</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-ink/50">Admin login</p>
          </div>

          <div className="parchment-card rounded-lg p-8">
            <div className="mb-6">
              <h2 className="font-display text-4xl text-ink">Sign in</h2>
              <div className="mt-3 h-px w-12 bg-line/80" />
            </div>

            {!configured ? (
              <div className="mb-4 rounded-lg border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-ink">
                Admin login is not configured yet. Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `AUTH_SECRET` to your environment.
              </div>
            ) : null}
            {error ? (
              <div className="mb-4 rounded-lg border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-ink">
                {error}
              </div>
            ) : null}

            <form action={loginAction} className="space-y-5">
              <input type="hidden" name="next" value={nextPath} />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink/70">Collector identity</span>
                <input name="username" autoComplete="username" placeholder="Username" className="rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-base focus:ring-0" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink/70">Access key</span>
                <input name="password" type="password" autoComplete="current-password" placeholder="Password" className="rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-base focus:ring-0" />
              </label>
              <button
                type="submit"
                disabled={!configured}
                className="inline-flex w-full items-center justify-center rounded-sm bg-[#e6c093] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-[#d8b382] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Login
              </button>
            </form>

            <div className="mt-8 border-t border-line/35 pt-6 text-sm leading-7 text-ink/68">
              This area is only for managing the collection.
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
