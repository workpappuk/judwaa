import { FiCopy, FiEye, FiPlay, FiPlus } from "react-icons/fi";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import type { IncentiveScheme, IncentiveSchemeRequest, IncentiveSchemeStatus } from "@/types/incentive";
import { formatDate, formatDateTime } from "@/components/incentive/utils";

interface SchemesTabProps {
  schemeStatusFilter: IncentiveSchemeStatus | "ALL";
  schemeQuery: string;
  onSchemeStatusFilterChange: (value: IncentiveSchemeStatus | "ALL") => void;
  onSchemeQueryChange: (value: string) => void;
  onShowSchemeForm: () => void;
  showSchemeForm: boolean;
  schemeForm: IncentiveSchemeRequest;
  onSchemeFormChange: (changes: Partial<IncentiveSchemeRequest>) => void;
  canCreateScheme: boolean;
  onCreateScheme: () => void;
  onCancelSchemeForm: () => void;
  loadingSchemes: boolean;
  filteredSchemes: IncentiveScheme[];
  selectedSchemeId?: string;
  onSelectScheme: (scheme: IncentiveScheme) => void;
  onViewRules: (scheme: IncentiveScheme) => void;
  onRunCalculation: (scheme: IncentiveScheme) => void;
  runningCalculation: boolean;
  onDuplicateScheme: (scheme: IncentiveScheme) => void;
}

export default function SchemesTab({
  schemeStatusFilter,
  schemeQuery,
  onSchemeStatusFilterChange,
  onSchemeQueryChange,
  onShowSchemeForm,
  showSchemeForm,
  schemeForm,
  onSchemeFormChange,
  canCreateScheme,
  onCreateScheme,
  onCancelSchemeForm,
  loadingSchemes,
  filteredSchemes,
  selectedSchemeId,
  onSelectScheme,
  onViewRules,
  onRunCalculation,
  runningCalculation,
  onDuplicateScheme,
}: SchemesTabProps) {
  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, justifyContent: "space-between", alignItems: { md: "flex-end" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Incentive Schemes</Typography>
          <Typography variant="body2" color="text.secondary">Pick a scheme to manage rules or run payout calculations.</Typography>
        </Box>
        <Box sx={{ width: { xs: "100%", md: "auto" }, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
          <TextField
            size="small"
            value={schemeQuery}
            onChange={(event) => onSchemeQueryChange(event.target.value)}
            placeholder="Search schemes"
            label="Search"
            sx={{ minWidth: { sm: 220 } }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={schemeStatusFilter}
              label="Status"
              onChange={(event) => onSchemeStatusFilterChange(event.target.value as IncentiveSchemeStatus | "ALL")}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="DRAFT">DRAFT</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="LOCKED">LOCKED</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={onShowSchemeForm} variant="contained" startIcon={<FiPlus />}>
            New Scheme
          </Button>
        </Box>
      </Box>

      {showSchemeForm ? (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Create New Scheme</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define timeline and status first. You can add rules right after creating.
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <TextField
                label="Scheme Name"
                value={schemeForm.name}
                onChange={(event) => onSchemeFormChange({ name: event.target.value })}
                placeholder="e.g. Q2 Revenue Incentive"
                size="small"
                fullWidth
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={schemeForm.status}
                  label="Status"
                  onChange={(event) => onSchemeFormChange({ status: event.target.value as IncentiveSchemeStatus })}
                >
                  <MenuItem value="DRAFT">DRAFT</MenuItem>
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="LOCKED">LOCKED</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Start Date (YYYY-MM-DD)"
                type="date"
                value={schemeForm.startDate}
                onChange={(event) => onSchemeFormChange({ startDate: event.target.value })}
                size="small"
                fullWidth
              />

              <TextField
                label="End Date (YYYY-MM-DD)"
                type="date"
                value={schemeForm.endDate}
                onChange={(event) => onSchemeFormChange({ endDate: event.target.value })}
                size="small"
                fullWidth
              />

              <TextField
                label="Description"
                value={schemeForm.description}
                onChange={(event) => onSchemeFormChange({ description: event.target.value })}
                rows={3}
                multiline
                size="small"
                fullWidth
                sx={{ gridColumn: { md: "span 2" } }}
              />
            </Box>

            <Box sx={{ mt: 2, display: "flex", gap: 1.5 }}>
              <Button onClick={onCreateScheme} variant="contained" disabled={!canCreateScheme}>Create Scheme</Button>
              <Button onClick={onCancelSchemeForm} variant="outlined">Cancel</Button>
            </Box>
          </CardContent>
        </Card>
      ) : null}

      {loadingSchemes ? (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="65%" />
          </CardContent>
        </Card>
      ) : null}

      {!loadingSchemes && filteredSchemes.length === 0 ? (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          No schemes match the current search and filter.
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 1.5 }}>
        {filteredSchemes.map((scheme) => {
          const isSelected = selectedSchemeId === scheme.id;
          const statusColor = scheme.status === "ACTIVE" ? "success" : scheme.status === "DRAFT" ? "default" : "info";

          return (
            <Card
              key={scheme.id}
              variant="outlined"
              onClick={() => onSelectScheme(scheme)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onSelectScheme(scheme);
                }
              }}
              sx={{
                cursor: "pointer",
                borderColor: isSelected ? "primary.main" : "divider",
                boxShadow: isSelected ? (theme) => `0 0 0 2px ${theme.palette.primary.light}` : undefined,
                "&:hover": { borderColor: "text.secondary" },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ mb: 1, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {scheme.name}
                      </Typography>
                      <Chip size="small" color={statusColor as "default" | "success" | "info"} label={scheme.status} />
                      <Typography variant="caption" color="text.secondary">v{scheme.version}</Typography>
                      {isSelected ? <Chip size="small" color="primary" variant="outlined" label="Selected" /> : null}
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(scheme.startDate)} to {formatDate(scheme.endDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{scheme.totalRules} rules</Typography>
                      {scheme.lastRunAt ? <Typography variant="caption" color="text.secondary">Last run: {formatDateTime(scheme.lastRunAt)}</Typography> : null}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="View Rules">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          onViewRules(scheme);
                        }}
                      >
                        <FiEye />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Run Calculation">
                      <span>
                        <IconButton
                          size="small"
                          color="success"
                          disabled={runningCalculation}
                          onClick={(event) => {
                            event.stopPropagation();
                            onRunCalculation(scheme);
                          }}
                        >
                          <FiPlay />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDuplicateScheme(scheme);
                        }}
                      >
                        <FiCopy />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
