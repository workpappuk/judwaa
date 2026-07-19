import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    appSlug: string;
    pageSlug: string;
  }>;
};

export default async function NocodeRuntimePage({ params }: PageProps) {
  const { appSlug, pageSlug } = await params;
  redirect(`/judwaa/admin/nocode/${appSlug}/${pageSlug}`);
}
