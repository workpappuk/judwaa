import { NextResponse } from "next/server";

import { getOnboardingSummary } from "../../../_lib/repository";

export async function GET() {
  const summary = await getOnboardingSummary();

  return NextResponse.json(summary);
}
