import { notFound } from "next/navigation";

import { updateCoinAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { CoinForm } from "@/components/coin-form";
import { SectionCard } from "@/components/cards";
import { getCoinById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditCoinPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coin = await getCoinById(Number(id));

  if (!coin) {
    notFound();
  }

  const action = updateCoinAction.bind(null, coin.id);

  return (
    <AppShell currentPath="/coins">
      <SectionCard title={`Edit ${coin.title}`} description="Update any imported or manual field before saving.">
        <CoinForm action={action} submitLabel="Save changes" initialValues={coin} />
      </SectionCard>
    </AppShell>
  );
}
