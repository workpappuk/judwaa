import { NextResponse } from "next/server";

import { listCompanyOnboardings } from "@/app/nocode/_lib/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domainSlug = url.searchParams.get("domain") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const sanitizedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 50;
  const sanitizedOffset = Number.isFinite(offset) ? Math.max(offset, 0) : 0;

  const companies = await listCompanyOnboardings({
    domainSlug,
    limit: sanitizedLimit,
    offset: sanitizedOffset,
  });

  return NextResponse.json({
    total: companies.length,
    domain: domainSlug ?? "all",
    limit: sanitizedLimit,
    offset: sanitizedOffset,
    companies,
  });
}
