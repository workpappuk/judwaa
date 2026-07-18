import { Box, Button, Paper, Typography } from "@mui/material";
import { FiLayers, FiPlus } from "react-icons/fi";

import { formatCompactNumber } from "@/components/incentive/utils";

interface HeroSectionProps {
  schemesCount: number;
  activeSchemeCount: number;
  draftSchemeCount: number;
  totalRulesAcrossSchemes: number;
  onCreateScheme: () => void;
}

export default function HeroSection({
  schemesCount,
  activeSchemeCount,
  draftSchemeCount,
  totalRulesAcrossSchemes,
  onCreateScheme,
}: HeroSectionProps) {
  return (
    <Paper variant="outlined" sx={{ mb: 3, p: 2.5 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ mb: 1, display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.5, borderRadius: 99, bgcolor: "info.50", color: "info.dark", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
            <FiLayers size={12} />
            Incentive Engine
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Distributor Incentive Manager</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>Build schemes, author rules, and run payout calculations from one place.</Typography>
        </Box>
        <Button onClick={onCreateScheme} variant="contained" size="small" startIcon={<FiPlus />}>
          Create Scheme
        </Button>
      </Box>

      <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 1 }}>
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>Schemes</Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 700 }}>{formatCompactNumber(schemesCount)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active</Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 700, color: "success.main" }}>{formatCompactNumber(activeSchemeCount)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>Drafts</Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 700, color: "warning.main" }}>{formatCompactNumber(draftSchemeCount)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Rules</Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 700 }}>{formatCompactNumber(totalRulesAcrossSchemes)}</Typography>
        </Paper>
      </Box>
    </Paper>
  );
}
