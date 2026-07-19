import Link from "next/link";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";

import { getOnboardingSummary, listApplications } from "../../../nocode/_lib/repository";

export default async function NocodeAdminHomePage() {
  const applications = await listApplications();
  const onboardingSummary = await getOnboardingSummary();

  return (
    <Box sx={{ minHeight: "calc(100vh - 7rem)", borderRadius: 2, bgcolor: "#f7fafc", p: 1.5 }}>
      <Box sx={{ mx: "auto", maxWidth: 1200, display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary" }}>
            Nocode Platform
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
            Metadata-Driven Runtime
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 900, color: "text.secondary" }}>
            Applications below are generated from metadata only. Each card links to runtime-rendered pages and uses the same engine.
          </Typography>

          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1.2 }}>
            <Link href="/judwaa/admin/nocode/studio"><Button variant="contained">Open Studio</Button></Link>
            <Link href="/judwaa/admin/nocode/api/metadata"><Button variant="outlined">View Metadata API</Button></Link>
            <Link href="/judwaa/admin/nocode/api/onboarding/summary"><Button variant="outlined">View Onboarding API</Button></Link>
            <Link href="/nocode/marketing"><Button variant="outlined">Open Marketing Page</Button></Link>
          </Box>

          <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" } }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Domains</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>{onboardingSummary.totalDomains}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Companies</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>{onboardingSummary.totalCompanies}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>In Progress</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700, color: "warning.main" }}>{onboardingSummary.byStatus["in-progress"]}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>Completed</Typography>
              <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700, color: "success.main" }}>{onboardingSummary.byStatus.completed}</Typography>
            </Paper>
          </Box>
        </Paper>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" } }}>
          {applications.map((application) => {
            const defaultPage = application.menu[0]?.pageSlug ?? application.pages[0]?.slug;

            return (
              <Paper key={application.id} variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
                  {application.domain}
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.75, fontWeight: 800, color: application.theme.brand }}>
                  {application.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>{application.description}</Typography>

                <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip size="small" label={`v${application.metadataVersion.versionNumber}`} variant="outlined" />
                  <Chip size="small" label={`schema ${application.metadataVersion.schemaVersion}`} variant="outlined" />
                  <Chip size="small" label={application.status} color="success" variant="outlined" />
                  <Chip size="small" label={`${application.pages.length} pages`} variant="outlined" />
                </Box>

                <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {application.menu.map((item) => (
                    <Link key={item.id} href={`/judwaa/admin/nocode/${application.slug}/${item.pageSlug}`}>
                      <Button size="small" variant="outlined">{item.label}</Button>
                    </Link>
                  ))}
                </Box>

                {defaultPage ? (
                  <Link href={`/judwaa/admin/nocode/${application.slug}/${defaultPage}`}>
                    <Button size="small" sx={{ mt: 1.5 }}>Launch runtime</Button>
                  </Link>
                ) : null}
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
