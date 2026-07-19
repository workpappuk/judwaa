import { NextResponse } from "next/server";

import { findApplication } from "../../../_lib/repository";

type Context = {
  params: Promise<{
    appSlug: string;
  }>;
};

export async function GET(_request: Request, context: Context) {
  const { appSlug } = await context.params;
  const application = await findApplication(appSlug);

  if (!application) {
    return NextResponse.json({ message: "Application not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}
