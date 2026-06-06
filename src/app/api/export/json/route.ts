import { NextResponse } from "next/server";

import { searchCoinsInCollection } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const coins = await searchCoinsInCollection();

  return new NextResponse(JSON.stringify(coins, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="coinatlas-export.json"'
    }
  });
}
