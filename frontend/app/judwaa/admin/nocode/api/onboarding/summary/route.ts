import { NextResponse } from "next/server";

import { getOnboardingSummary } from "@/app/nocode/_lib/repository";

export async function GET() {
  const summary = await getOnboardingSummary();

  return NextResponse.json(summary);
}
