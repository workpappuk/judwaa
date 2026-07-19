import { NextResponse } from "next/server";

import { listApplications } from "../../_lib/repository";

export async function GET() {
  const applications = await listApplications();

  return NextResponse.json({
    total: applications.length,
    applications,
  });
}
