import { NextResponse } from "next/server";

import { findApplication, findPage } from "../../../../_lib/repository";

type Context = {
  params: Promise<{
    appSlug: string;
    pageSlug: string;
  }>;
};

export async function GET(_request: Request, context: Context) {
  const { appSlug, pageSlug } = await context.params;
  const application = await findApplication(appSlug);

  if (!application) {
    return NextResponse.json({ message: "Application not found" }, { status: 404 });
  }

  const page = await findPage(appSlug, pageSlug);

  if (!page) {
    return NextResponse.json({ message: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({
    application: {
      slug: application.slug,
      name: application.name,
      version: application.version,
      metadataVersion: application.metadataVersion,
      theme: application.theme,
    },
    page,
  });
}
