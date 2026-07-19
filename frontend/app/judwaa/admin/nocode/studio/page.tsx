import Link from "next/link";
import { Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import { getOnboardingSummary, listApplications } from "@/app/nocode/_lib/repository";

export default async function NocodeAdminStudioPage() {
  const applications = await listApplications();
  const onboardingSummary = await getOnboardingSummary();

  return (
    <Box sx={{ minHeight: "calc(100vh - 7rem)", borderRadius: 2, bgcolor: "#fff7ed", p: 1.5 }}>
      <Box sx={{ mx: "auto", maxWidth: 1200, display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", color: "warning.dark" }}>
            Builder Studio
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
            Metadata Registry
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
            This studio view is intentionally metadata-first: it inspects schema shape and routes without any domain-specific page code.
          </Typography>
          <Link href="/judwaa/admin/nocode">
            <Button variant="contained" color="warning" sx={{ mt: 2 }}>
              Back to Runtime Hub
            </Button>
          </Link>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Onboarding Scale</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Capacity snapshot for multi-tenant onboarding across {onboardingSummary.totalDomains} domains and {onboardingSummary.totalCompanies} companies.
          </Typography>

          <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" } }}>
            {onboardingSummary.byDomain.map((entry) => (
              <Paper key={entry.domainSlug} variant="outlined" sx={{ p: 1.5, bgcolor: "grey.50" }}>
                <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary" }}>
                  {entry.domainSlug}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 700 }}>{entry.companies} companies</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>

        {applications.map((application) => (
          <Paper key={application.id} variant="outlined" sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{application.name}</Typography>
              <Typography variant="caption" sx={{ px: 1, py: 0.25, border: 1, borderColor: "divider", borderRadius: 1 }}>
                {application.slug}
              </Typography>
              <Typography variant="caption" sx={{ px: 1, py: 0.25, border: 1, borderColor: "divider", borderRadius: 1 }}>
                v{application.metadataVersion.versionNumber}
              </Typography>
              <Typography variant="caption" sx={{ px: 1, py: 0.25, border: 1, borderColor: "divider", borderRadius: 1 }}>
                schema {application.metadataVersion.schemaVersion}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>{application.description}</Typography>
            <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "text.secondary" }}>
              versionId: {application.metadataVersion.versionId} | updated: {new Date(application.metadataVersion.updatedAt).toLocaleString()}
            </Typography>

            <Box sx={{ mt: 2, overflowX: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Page</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Sections</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Components</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fields</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Route</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {application.pages.map((page) => {
                    const componentCount = page.sections.reduce((acc, section) => acc + section.components.length, 0);
                    const fieldCount = page.sections.reduce(
                      (acc, section) => acc + section.components.reduce((inner, component) => inner + (component.fields?.length ?? 0), 0),
                      0,
                    );

                    return (
                      <TableRow key={page.id}>
                        <TableCell>{page.title}</TableCell>
                        <TableCell>{page.sections.length}</TableCell>
                        <TableCell>{componentCount}</TableCell>
                        <TableCell>{fieldCount}</TableCell>
                        <TableCell>
                          <Link href={`/judwaa/admin/nocode/${application.slug}/${page.slug}`}>
                            <Button size="small">/judwaa/admin/nocode/{application.slug}/{page.slug}</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
