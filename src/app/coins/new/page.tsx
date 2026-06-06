import { CoinForm } from "@/components/coin-form";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/cards";
import { createCoinAction } from "@/app/actions";
import { getCatalogProvider } from "@/lib/providers";
import { mapCatalogDetailsToCoin } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewCoinPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const numistaId = typeof params.numistaId === "string" ? params.numistaId : null;
  const provider = getCatalogProvider();
  const imported = numistaId ? mapCatalogDetailsToCoin(await provider.getCoinDetails(numistaId)) : undefined;

  return (
    <AppShell currentPath="/coins">
      <SectionCard
        title="Add coin"
        description="Create a manual entry or pre-fill from a Numista candidate. Every imported field remains editable."
      >
        <CoinForm action={createCoinAction} submitLabel="Save to collection" initialValues={imported} />
      </SectionCard>
    </AppShell>
  );
}
