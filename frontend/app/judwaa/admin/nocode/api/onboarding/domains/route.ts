import { NextResponse } from "next/server";

import { listDomains } from "@/app/nocode/_lib/repository";

export async function GET() {
  const domains = await listDomains();

  return NextResponse.json({
    total: domains.length,
    domains,
  });
}
