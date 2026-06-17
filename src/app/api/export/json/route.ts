import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { searchCoinsInCollection } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const coins = await searchCoinsInCollection();

  return new NextResponse(JSON.stringify(coins, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="coinatlas-export.json"'
    }
  });
}
