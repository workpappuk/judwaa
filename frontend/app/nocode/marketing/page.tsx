import { Box, Button, Chip, Grid, Paper, Stack, Typography } from "@mui/material";

const pillars = [
  {
    title: "Metadata First",
    text: "Design applications once with metadata and launch across domains without duplicating page code.",
  },
  {
    title: "Runtime Native",
    text: "Render forms, workflows, menus, and permissions from schema at runtime for faster releases.",
  },
  {
    title: "Enterprise Ready",
    text: "Role controls, audit trails, and tenant-aware onboarding built into one operational platform.",
  },
];

const highlights = [
  { label: "Target Domains", value: "10+" },
  { label: "Company Onboarding", value: "500" },
  { label: "Deployment Model", value: "Modular Monolith" },
  { label: "Builder Speed", value: "Days, not months" },
];

const trustSignals = ["Schema Versioning", "Tenant Ready", "Role Controls", "Audit Friendly"];

export default function NocodeMarketingPage() {
  return (
    <Box
      component="main"
      sx={{
        position: "relative",
        minHeight: "calc(100vh - 7rem)",
        borderRadius: 3,
        overflow: "hidden",
        p: 1.5,
        background:
          "linear-gradient(125deg, rgba(var(--mui-palette-warning-lightChannel) / 0.18) 0%, rgba(var(--mui-palette-info-lightChannel) / 0.2) 48%, rgba(var(--mui-palette-primary-lightChannel) / 0.2) 100%)",
        "@keyframes fadeInUp": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes softPulse": {
          "0%": { transform: "scale(1)", opacity: 0.75 },
          "100%": { transform: "scale(1.22)", opacity: 0.15 },
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(var(--mui-palette-text-primaryChannel) / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--mui-palette-text-primaryChannel) / 0.04) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(circle at center, black 36%, transparent 100%)",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -120,
          left: -100,
          width: 280,
          height: 280,
          borderRadius: "50%",
          bgcolor: "rgba(var(--mui-palette-warning-mainChannel) / 0.24)",
          filter: "blur(12px)",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -120,
          right: -120,
          width: 320,
          height: 320,
          borderRadius: "50%",
          bgcolor: "rgba(var(--mui-palette-info-mainChannel) / 0.2)",
          filter: "blur(18px)",
        }}
      />

      <Paper
        elevation={10}
        sx={{
          position: "relative",
          mx: "auto",
          maxWidth: 1200,
          borderRadius: 4,
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4.5 },
          backgroundColor: "rgba(var(--mui-palette-background-paperChannel) / 0.86)",
          backdropFilter: "blur(8px)",
          border: "1px solid",
          borderColor: "divider",
          animation: "fadeInUp 560ms ease-out",
        }}
      >
        <Grid container spacing={3.5}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
              <Chip
                label="Nocode Platform"
                sx={{
                  borderRadius: 1,
                  bgcolor: "warning.main",
                  color: "warning.contrastText",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              />
              <Typography variant="caption" sx={{ color: "info.dark", fontWeight: 700, letterSpacing: "0.06em" }}>
                Metadata Runtime
              </Typography>
              <Box
                aria-hidden
                sx={{
                  ml: 0.5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  boxShadow: "0 0 0 0 rgba(var(--mui-palette-success-mainChannel) / 0.45)",
                  animation: "softPulse 1.5s ease-in-out infinite alternate",
                }}
              />
            </Box>

            <Typography
              variant="h2"
              sx={{
                mt: 2,
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "text.primary",
                fontSize: { xs: "2rem", sm: "2.45rem", lg: "3.1rem" },
              }}
            >
              Build enterprise apps from metadata, not repetitive code.
            </Typography>

            <Typography variant="body1" sx={{ mt: 2, maxWidth: 720, lineHeight: 1.8, color: "text.secondary" }}>
              Launch HR, CRM, trade finance, procurement, and more from one runtime engine. Your team configures
              business logic while the platform handles rendering, access, workflow, and governance.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.25 }}>
              <Button
                href="/nocode/onboard"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "success.main",
                  fontWeight: 800,
                  borderRadius: 2,
                  px: 2.2,
                  boxShadow: "0 12px 22px rgba(var(--mui-palette-success-mainChannel) / 0.22)",
                  "&:hover": { bgcolor: "success.dark", transform: "translateY(-1px)" },
                }}
              >
                Start Company Onboarding
              </Button>
              <Button
                href="/judwaa/admin/nocode"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "primary.dark",
                  fontWeight: 800,
                  borderRadius: 2,
                  px: 2.2,
                  "&:hover": { bgcolor: "primary.main", transform: "translateY(-1px)" },
                }}
              >
                Open Platform Admin
              </Button>
              <Button
                href="/judwaa/admin/nocode/studio"
                variant="outlined"
                size="large"
                sx={{
                  fontWeight: 800,
                  borderRadius: 2,
                  borderColor: "rgba(var(--mui-palette-text-primaryChannel) / 0.24)",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "rgba(var(--mui-palette-text-primaryChannel) / 0.5)",
                    backgroundColor: "rgba(var(--mui-palette-text-primaryChannel) / 0.03)",
                  },
                }}
              >
                Explore Studio
              </Button>
            </Stack>

            <Box sx={{ mt: 2.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {trustSignals.map((signal) => (
                <Chip
                  key={signal}
                  label={signal}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 1,
                    borderColor: "rgba(var(--mui-palette-info-mainChannel) / 0.35)",
                    color: "text.primary",
                    backgroundColor: "rgba(var(--mui-palette-background-paperChannel) / 0.7)",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>

            <Grid container spacing={1.5} sx={{ mt: 2.5 }}>
              {pillars.map((pillar, index) => (
                <Grid key={pillar.title} size={{ xs: 12, sm: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      p: 2,
                      borderColor: "divider",
                      background: "linear-gradient(180deg, var(--mui-palette-background-paper) 0%, rgba(var(--mui-palette-primary-lightChannel) / 0.06) 100%)",
                      animation: `fadeInUp ${520 + index * 120}ms ease-out`,
                      transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        borderColor: "rgba(var(--mui-palette-info-mainChannel) / 0.42)",
                        boxShadow: "0 10px 18px rgba(var(--mui-palette-text-primaryChannel) / 0.08)",
                      },
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 800 }}>
                      {pillar.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", lineHeight: 1.7 }}>
                      {pillar.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: 2.5,
                color: "common.white",
                bgcolor: "grey.900",
                border: "1px solid",
                borderColor: "divider",
                backgroundImage: "radial-gradient(circle at top right, rgba(var(--mui-palette-info-mainChannel) / 0.18), transparent 46%)",
                animation: "fadeInUp 700ms ease-out",
              }}
            >
              <Typography variant="overline" sx={{ letterSpacing: "0.12em", color: "warning.light", fontWeight: 700 }}>
                Market Snapshot
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900, color: "grey.50" }}>
                Built for scale
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.2, color: "grey.400", lineHeight: 1.7 }}>
                A single runtime powering multiple business domains with tenant onboarding and schema version control.
              </Typography>

              <Grid container spacing={1.2} sx={{ mt: 2.2 }}>
                {highlights.map((item, index) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 1.25,
                        border: "1px solid rgba(var(--mui-palette-grey-500Channel) / 0.65)",
                        bgcolor: "rgba(var(--mui-palette-grey-900Channel) / 0.6)",
                        animation: `fadeInUp ${740 + index * 120}ms ease-out`,
                        transition: "border-color 180ms ease, background-color 180ms ease",
                        "&:hover": {
                          borderColor: "rgba(var(--mui-palette-info-lightChannel) / 0.52)",
                          backgroundColor: "rgba(var(--mui-palette-grey-900Channel) / 0.75)",
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ letterSpacing: "0.07em", textTransform: "uppercase", color: "grey.400" }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h5" sx={{ mt: 0.4, color: "grey.50", fontWeight: 800 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Paper
                variant="outlined"
                sx={{
                  mt: 2.2,
                  borderRadius: 2,
                  p: 1.5,
                  bgcolor: "rgba(var(--mui-palette-warning-mainChannel) / 0.12)",
                  borderColor: "rgba(var(--mui-palette-warning-mainChannel) / 0.4)",
                }}
              >
                <Typography variant="caption" sx={{ letterSpacing: "0.07em", textTransform: "uppercase", color: "warning.light" }}>
                  Core Promise
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.6, color: "warning.light" }}>
                  Configuration over code, versioned metadata, and rapid rollout across business lines.
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
