import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/cards";
import { requireAdminSession } from "@/lib/auth";
import { getEnv, getEnvHealth } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminSession();
  const env = getEnv();
  const health = getEnvHealth();

  const rows: Array<[string, boolean, string]> = [
    ["DATABASE_URL", health.DATABASE_URL, "SQLite database path"],
    ["NUMISTA_API_KEY", health.NUMISTA_API_KEY, "Required for Numista catalog search and details"],
    ["GOOGLE_API_KEY", health.GOOGLE_API_KEY, "Required for Gemini OCR and image analysis"],
    ["ADMIN_USERNAME", health.ADMIN_USERNAME, "Shared admin username for the protected panel"],
    ["ADMIN_PASSWORD", health.ADMIN_PASSWORD, "Shared admin password for the protected panel"],
    ["AUTH_SECRET", health.AUTH_SECRET, "Signs the admin session cookie"],
    ["UPLOAD_DIR", health.UPLOAD_DIR, "Local directory for uploaded files"]
  ];

  return (
    <AppShell currentPath="/settings">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Provider configuration" description="Secret values are never shown here, only whether they are configured.">
          <div className="space-y-3">
            {rows.map(([key, configured, note]) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-line/70 bg-paper/75 p-4">
                <div>
                  <h3 className="font-semibold text-ink">{key}</h3>
                  <p className="text-sm text-ink/70">{note}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${configured ? "bg-moss text-white" : "bg-accent text-white"}`}>
                  {configured ? "Configured" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Runtime choices" description="Provider-based architecture keeps future OCR and catalog integrations swappable.">
          <dl className="space-y-3 text-sm text-ink/75">
            <div className="flex justify-between gap-3 rounded-[1.25rem] bg-paper/70 p-4">
              <dt>OCR provider</dt>
              <dd>{env.googleOcrProvider}</dd>
            </div>
            <div className="flex justify-between gap-3 rounded-[1.25rem] bg-paper/70 p-4">
              <dt>AI provider</dt>
              <dd>{env.aiProvider}</dd>
            </div>
            <div className="flex justify-between gap-3 rounded-[1.25rem] bg-paper/70 p-4">
              <dt>Numista base URL</dt>
              <dd>{env.numistaApiBaseUrl}</dd>
            </div>
            <div className="flex justify-between gap-3 rounded-[1.25rem] bg-paper/70 p-4">
              <dt>Max upload size</dt>
              <dd>{env.maxUploadSizeMb} MB</dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </AppShell>
  );
}
