import { notFound, redirect } from "next/navigation";

import { findApplication } from "@/app/nocode/_lib/repository";

type PageProps = {
  params: Promise<{
    appSlug: string;
  }>;
};

export default async function NocodeAdminAppEntryPage({ params }: PageProps) {
  const { appSlug } = await params;
  const application = await findApplication(appSlug);

  if (!application) {
    notFound();
  }

  const firstPageSlug = application.menu[0]?.pageSlug ?? application.pages[0]?.slug;

  if (!firstPageSlug) {
    notFound();
  }

  redirect(`/judwaa/admin/nocode/${application.slug}/${firstPageSlug}`);
}
