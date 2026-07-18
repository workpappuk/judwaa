import { FiCheckCircle, FiClock, FiEye, FiPlay, FiXCircle } from "react-icons/fi";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import type { IncentiveCalculationRun, IncentiveScheme } from "@/types/incentive";
import { formatDateTime, formatDuration } from "@/components/incentive/utils";

interface RunsTabProps {
  selectedScheme: IncentiveScheme | null;
  calculationRuns: IncentiveCalculationRun[];
  completedRunsCount: number;
  loadingRuns: boolean;
  runningCalculation: boolean;
  onRunNewCalculation: () => void;
}

export default function RunsTab({
  selectedScheme,
  calculationRuns,
  completedRunsCount,
  loadingRuns,
  runningCalculation,
  onRunNewCalculation,
}: RunsTabProps) {
  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1, mb: 2 }}>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Runs</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{calculationRuns.length}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Completed</Typography><Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>{completedRunsCount}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Selected Scheme</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{selectedScheme?.name ?? "None"}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Total Payout</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(calculationRuns.reduce((sum, run) => sum + run.totalPayout, 0))}</Typography></CardContent></Card>
      </Box>

      <Box sx={{ mb: 2, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Calculation History</Typography>
        <Button
          onClick={onRunNewCalculation}
          disabled={runningCalculation || !selectedScheme}
          variant="contained"
          color="success"
          startIcon={<FiPlay />}
        >
          {runningCalculation ? "Running..." : "Run New Calculation"}
        </Button>
      </Box>

      {loadingRuns ? <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>Loading calculation history...</Alert> : null}

      {!loadingRuns ? (
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Scheme</TableCell>
                <TableCell>Date and Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Distributors</TableCell>
                <TableCell>Total Payout</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calculationRuns.map((run) => {
                const color = run.status === "COMPLETED" ? "success" : run.status === "RUNNING" ? "info" : "error";
                return (
                  <TableRow key={run.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{selectedScheme?.name ?? "-"}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{formatDateTime(run.runAt)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={color as "success" | "info" | "error"}
                        label={run.status}
                        icon={run.status === "COMPLETED" ? <FiCheckCircle /> : run.status === "RUNNING" ? <FiClock /> : <FiXCircle />}
                      />
                    </TableCell>
                    <TableCell>{run.distributors}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(run.totalPayout)}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{formatDuration(run.durationMs)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Results">
                        <IconButton size="small" color="primary">
                          <FiEye />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {calculationRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No calculation runs yet for selected scheme.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
}
