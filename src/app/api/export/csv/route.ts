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
  const headers = [
    "id",
    "numistaId",
    "title",
    "country",
    "issuer",
    "denomination",
    "currency",
    "year",
    "quantity",
    "condition",
    "storageLocation",
    "notes",
    "sourceUrl",
    "createdAt"
  ];

  const rows = coins.map((coin) =>
    headers
      .map((header) => {
        const value = String(coin[header as keyof typeof coin] ?? "");
        return `"${value.replaceAll('"', '""')}"`
      })
      .join(",")
  );

  return new NextResponse([headers.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="coinatlas-export.csv"'
    }
  });
}
