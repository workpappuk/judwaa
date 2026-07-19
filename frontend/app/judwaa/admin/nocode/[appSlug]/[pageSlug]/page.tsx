import Link from "next/link";
import { Box, Button, Paper, Typography } from "@mui/material";
import { notFound } from "next/navigation";

import { findApplication, findPage } from "@/app/nocode/_lib/repository";
import { RuntimePage } from "@/app/nocode/_lib/runtime";

type PageProps = {
  params: Promise<{
    appSlug: string;
    pageSlug: string;
  }>;
};

export default async function NocodeAdminRuntimePage({ params }: PageProps) {
  const { appSlug, pageSlug } = await params;
  const application = await findApplication(appSlug);

  if (!application) {
    notFound();
  }

  const page = await findPage(appSlug, pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
          <Link href="/judwaa/admin/nocode"><Button size="small" variant="outlined">All Applications</Button></Link>
          {application.menu.map((item) => (
            <Link key={item.id} href={`/judwaa/admin/nocode/${application.slug}/${item.pageSlug}`}>
              <Button size="small" variant={item.pageSlug === page.slug ? "contained" : "outlined"}>{item.label}</Button>
            </Link>
          ))}
          <Typography variant="caption" sx={{ ml: "auto", px: 1, py: 0.5, border: 1, borderColor: "divider", borderRadius: 1, color: "text.secondary" }}>
            {application.name} v{application.metadataVersion.versionNumber} ({application.metadataVersion.schemaVersion})
          </Typography>
        </Box>
      </Paper>
      <RuntimePage page={page} theme={application.theme} />
    </Box>
  );
}
