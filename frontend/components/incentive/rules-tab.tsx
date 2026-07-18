import { FiBarChart2, FiEdit2, FiPlus, FiTarget, FiTrash2 } from "react-icons/fi";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import type {
  IncentiveConflictStrategy,
  IncentiveRule,
  IncentiveRuleStatus,
  IncentiveRuleType,
  IncentiveScheme,
} from "@/types/incentive";
import { parseConditions, parseSlabs, type ConditionRow, type SlabRow } from "@/components/incentive/utils";

interface RulesTabProps {
  selectedScheme: IncentiveScheme | null;
  showRuleBuilder: boolean;
  editingRuleId: string | null;
  ruleName: string;
  ruleType: IncentiveRuleType;
  rulePriority: string;
  ruleStatus: IncentiveRuleStatus;
  conflictStrategy: IncentiveConflictStrategy;
  conditions: ConditionRow[];
  slabs: SlabRow[];
  canCreateRule: boolean;
  loadingRules: boolean;
  rules: IncentiveRule[];
  activeRulesCount: number;
  onBackToSchemes: () => void;
  onShowRuleBuilder: () => void;
  onRuleNameChange: (value: string) => void;
  onRuleTypeChange: (value: IncentiveRuleType) => void;
  onRulePriorityChange: (value: string) => void;
  onRuleStatusChange: (value: IncentiveRuleStatus) => void;
  onConflictStrategyChange: (value: IncentiveConflictStrategy) => void;
  onConditionFieldChange: (index: number, value: string) => void;
  onConditionOperatorChange: (index: number, value: string) => void;
  onConditionValue1Change: (index: number, value: string) => void;
  onConditionValue2Change: (index: number, value: string) => void;
  onAddCondition: () => void;
  onRemoveCondition: (index: number) => void;
  onSlabMinChange: (index: number, value: string) => void;
  onSlabMaxChange: (index: number, value: string) => void;
  onSlabPercentChange: (index: number, value: string) => void;
  onAddSlab: () => void;
  onRemoveSlab: (index: number) => void;
  onSaveRule: () => void;
  onCancelRuleBuilder: () => void;
  onEditRule: (rule: IncentiveRule) => void;
  onDeleteRule: (ruleId: string) => void;
}

export default function RulesTab({
  selectedScheme,
  showRuleBuilder,
  editingRuleId,
  ruleName,
  ruleType,
  rulePriority,
  ruleStatus,
  conflictStrategy,
  conditions,
  slabs,
  canCreateRule,
  loadingRules,
  rules,
  activeRulesCount,
  onBackToSchemes,
  onShowRuleBuilder,
  onRuleNameChange,
  onRuleTypeChange,
  onRulePriorityChange,
  onRuleStatusChange,
  onConflictStrategyChange,
  onConditionFieldChange,
  onConditionOperatorChange,
  onConditionValue1Change,
  onConditionValue2Change,
  onAddCondition,
  onRemoveCondition,
  onSlabMinChange,
  onSlabMaxChange,
  onSlabPercentChange,
  onAddSlab,
  onRemoveSlab,
  onSaveRule,
  onCancelRuleBuilder,
  onEditRule,
  onDeleteRule,
}: RulesTabProps) {
  if (!selectedScheme) {
    return <Alert severity="info">Select a scheme from Schemes tab to manage rules.</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 2.5, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "space-between" }}>
        <Box>
          <Button onClick={onBackToSchemes} size="small" sx={{ px: 0, mb: 0.5 }}>
            Back to Schemes
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedScheme.name}</Typography>
          <Typography variant="body2" color="text.secondary">Manage rules for this scheme</Typography>
        </Box>
        <Button onClick={onShowRuleBuilder} variant="contained" startIcon={<FiPlus />}>
          Add Rule
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1, mb: 2 }}>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}><FiBarChart2 /> Total Rules</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{rules.length}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}><FiTarget /> Active</Typography><Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700 }}>{activeRulesCount}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Scheme</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{selectedScheme.name}</Typography></CardContent></Card>
        <Card variant="outlined"><CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Version</Typography><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>v{selectedScheme.version}</Typography></CardContent></Card>
      </Box>

      {showRuleBuilder ? (
        <Card variant="outlined" sx={{ mb: 2.5 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{editingRuleId ? "Edit Incentive Rule" : "Build Incentive Rule"}</Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <TextField label="Rule Name" size="small" fullWidth value={ruleName} onChange={(event) => onRuleNameChange(event.target.value)} placeholder="e.g. High Volume Slab" />
              <FormControl size="small" fullWidth>
                <InputLabel>Rule Type</InputLabel>
                <Select value={ruleType} label="Rule Type" onChange={(event) => onRuleTypeChange(event.target.value as IncentiveRuleType)}>
                  <MenuItem value="SLAB">Slab-based Incentive</MenuItem>
                  <MenuItem value="GROWTH">Growth-based Bonus</MenuItem>
                  <MenuItem value="TARGET">Target Achievement</MenuItem>
                  <MenuItem value="FLAT">Flat Percentage</MenuItem>
                  <MenuItem value="MIX">Product Mix Incentive</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Priority" type="number" size="small" fullWidth value={rulePriority} onChange={(event) => onRulePriorityChange(event.target.value)} />
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={ruleStatus} label="Status" onChange={(event) => onRuleStatusChange(event.target.value as IncentiveRuleStatus)}>
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="DRAFT">DRAFT</MenuItem>
                  <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={{ gridColumn: { md: "span 2" } }}>
                <InputLabel>Conflict Strategy</InputLabel>
                <Select
                  value={conflictStrategy}
                  label="Conflict Strategy"
                  onChange={(event) => onConflictStrategyChange(event.target.value as IncentiveConflictStrategy)}
                >
                  <MenuItem value="ADDITIVE">ADDITIVE</MenuItem>
                  <MenuItem value="MAX">MAX</MenuItem>
                  <MenuItem value="PRIORITY">PRIORITY</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2, mb: 1, display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle2">Conditions (IF)</Typography>
              <Button onClick={onAddCondition} size="small" startIcon={<FiPlus />}>Add Condition</Button>
            </Box>

            <Box sx={{ display: "grid", gap: 1 }}>
              {conditions.map((condition, idx) => (
                <Box key={`${condition.field}-${idx}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1.5fr 2fr 2fr auto" }, gap: 1, alignItems: "center" }}>
                  <FormControl size="small" fullWidth>
                    <Select value={condition.field} onChange={(event) => onConditionFieldChange(idx, event.target.value)}>
                      <MenuItem value="net_sales">Net Sales</MenuItem>
                      <MenuItem value="quantity">Quantity</MenuItem>
                      <MenuItem value="category">Product Category</MenuItem>
                      <MenuItem value="region">Region</MenuItem>
                      <MenuItem value="growth">Growth %</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <Select value={condition.operator} onChange={(event) => onConditionOperatorChange(idx, event.target.value)}>
                      <MenuItem value="=">=</MenuItem>
                      <MenuItem value=">">{">"}</MenuItem>
                      <MenuItem value="<">{"<"}</MenuItem>
                      <MenuItem value=">=">{">="}</MenuItem>
                      <MenuItem value="<=">{"<="}</MenuItem>
                      <MenuItem value="BETWEEN">BETWEEN</MenuItem>
                      <MenuItem value="IN">IN</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField size="small" fullWidth value={condition.value1} onChange={(event) => onConditionValue1Change(idx, event.target.value)} placeholder="Value" />
                  {condition.operator === "BETWEEN" ? (
                    <TextField size="small" fullWidth value={condition.value2} onChange={(event) => onConditionValue2Change(idx, event.target.value)} placeholder="To" />
                  ) : (
                    <Box />
                  )}
                  <IconButton color="error" disabled={conditions.length === 1} onClick={() => onRemoveCondition(idx)}>
                    <FiTrash2 />
                  </IconButton>
                </Box>
              ))}
            </Box>

            {ruleType === "SLAB" ? (
              <>
                <Box sx={{ mt: 2, mb: 1, display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle2">Slab Configuration (THEN)</Typography>
                  <Button onClick={onAddSlab} size="small" startIcon={<FiPlus />}>Add Slab</Button>
                </Box>
                <TableContainer component={Card} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Min Sales</TableCell>
                        <TableCell>Max Sales</TableCell>
                        <TableCell>Incentive %</TableCell>
                        <TableCell width={40} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {slabs.map((slab, idx) => (
                        <TableRow key={`slab-${idx}`}>
                          <TableCell><TextField size="small" fullWidth value={slab.min} onChange={(event) => onSlabMinChange(idx, event.target.value)} placeholder="0" /></TableCell>
                          <TableCell><TextField size="small" fullWidth value={slab.max} onChange={(event) => onSlabMaxChange(idx, event.target.value)} placeholder="Unlimited" /></TableCell>
                          <TableCell><TextField size="small" fullWidth value={slab.percent} onChange={(event) => onSlabPercentChange(idx, event.target.value)} placeholder="2.5" /></TableCell>
                          <TableCell><IconButton color="error" disabled={slabs.length === 1} onClick={() => onRemoveSlab(idx)}><FiTrash2 /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : null}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Rule Preview</Typography>
              <Typography variant="body2">
                IF {conditions.map((condition) => `${condition.field} ${condition.operator} ${condition.value1}`).join(" AND ")}
              </Typography>
              <Typography variant="body2">THEN apply {ruleType.toLowerCase()} incentive</Typography>
            </Alert>

            <Box sx={{ mt: 2, display: "flex", gap: 1.5 }}>
              <Button onClick={onSaveRule} disabled={!canCreateRule} color="success" variant="contained">
                {editingRuleId ? "Update Rule" : "Save Rule"}
              </Button>
              <Button onClick={onCancelRuleBuilder} variant="outlined">Cancel</Button>
            </Box>
          </CardContent>
        </Card>
      ) : null}

      {loadingRules ? <Alert severity="info" variant="outlined">Loading rules...</Alert> : null}

      {!loadingRules && !showRuleBuilder ? (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {rules.map((rule) => (
            <Card key={rule.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ mb: 1, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{rule.name}</Typography>
                      <Chip size="small" color="secondary" label={rule.type} />
                      <Typography variant="caption" color="text.secondary">Priority {rule.priority}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      <Typography variant="caption" color="text.secondary">Status: {rule.status}</Typography>
                      <Typography variant="caption" color="text.secondary">Strategy: {rule.conflictStrategy}</Typography>
                      <Typography variant="caption" color="text.secondary">{parseConditions(rule.conditionsJson).length} conditions</Typography>
                      {rule.type === "SLAB" && parseSlabs(rule.slabsJson).length > 0 ? (
                        <Typography variant="caption" color="text.secondary">{parseSlabs(rule.slabsJson).length} slabs</Typography>
                      ) : null}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="default" onClick={() => onEditRule(rule)}>
                        <FiEdit2 />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDeleteRule(rule.id)}>
                        <FiTrash2 />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {rules.length === 0 ? <Alert severity="info" variant="outlined">No rules found for this scheme.</Alert> : null}
        </Box>
      ) : null}
    </Box>
  );
}
