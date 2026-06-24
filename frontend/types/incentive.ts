export type IncentiveSchemeStatus = "DRAFT" | "ACTIVE" | "LOCKED";

export type IncentiveRuleType = "SLAB" | "GROWTH" | "TARGET" | "FLAT" | "MIX";

export type IncentiveRuleStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export type IncentiveConflictStrategy = "ADDITIVE" | "MAX" | "PRIORITY";

export type IncentiveRunStatus = "RUNNING" | "COMPLETED" | "FAILED";

export interface IncentiveScheme {
  id: string;
  name: string;
  description: string;
  status: IncentiveSchemeStatus;
  startDate: string;
  endDate: string;
  version: number;
  totalRules: number;
  lastRunAt: string | null;
}

export interface IncentiveRule {
  id: string;
  schemeId: string;
  name: string;
  type: IncentiveRuleType;
  priority: number;
  status: IncentiveRuleStatus;
  conflictStrategy: IncentiveConflictStrategy;
  conditionsJson: string;
  slabsJson: string | null;
  createdAt: string;
}

export interface IncentiveCalculationRun {
  id: string;
  schemeId: string;
  runAt: string;
  status: IncentiveRunStatus;
  distributors: number;
  totalPayout: number;
  durationMs: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface IncentiveSchemeRequest {
  name: string;
  description: string;
  status: IncentiveSchemeStatus;
  startDate: string;
  endDate: string;
}

export interface IncentiveRuleRequest {
  name: string;
  type: IncentiveRuleType;
  priority: number;
  status: IncentiveRuleStatus;
  conflictStrategy: IncentiveConflictStrategy;
  conditionsJson: string;
  slabsJson: string;
}
