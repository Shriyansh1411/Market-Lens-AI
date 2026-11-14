export type ClaimLabel = 'verified' | 'estimated' | 'ai_inferred';

export interface Claim {
  value: unknown;
  source_name: string;
  source_url: string;
  collected_at: string;
  label: ClaimLabel;
}

export type FieldStatus = 'agreed' | 'conflict' | 'unresolved' | 'no_data';
export type ResolutionRule = 'most_recent' | 'most_credible' | 'official_over_secondary' | 'user_override';

export interface FieldData {
  claims: Claim[];
  status: FieldStatus;
  resolution?: { rule: ResolutionRule; chosen: unknown; overridden_by_user: boolean };
}

export type Freshness = 'fresh' | 'aging' | 'stale';
export type TrustBand = 'high' | 'medium' | 'low';

/** Assumption: the spec lists trust_reasons[] without a shape. Each reason carries a factor name
 *  and an effect so TrustBreakdown can show the freshness effect straight from API data. */
export interface TrustReason { factor: string; detail: string; effect: 'raises' | 'lowers' | 'neutral' }

export interface Identifier { value: string; format_valid: boolean }
export interface Identifiers { gstin?: Identifier; cin?: Identifier; udyam?: Identifier; fssai?: Identifier }

export interface Entity {
  id: string;
  fields: Record<string, FieldData>;
  freshness: Freshness;
  trust_band: TrustBand;
  trust_reasons: TrustReason[];
  identifiers?: Identifiers;
}

export interface CoverageReport {
  requested_fields: string[];
  sources_checked: string[];
  /** field -> names of sources that returned data for it. Empty array = nothing found. */
  coverage: Record<string, string[]>;
}

export interface ResearchReceipt {
  query: string;
  plan: string[];
  sources: string[];
  rules: string[];
  collected_at: string;
  dataset_sha256: string;
  signature: string;
}

/* ---- Supporting API shapes (not specified in the brief; kept minimal) ---- */
export interface NormalisationChange { entity_id: string; field: string; before: unknown; after: unknown; rule: string }
export interface MergeCandidate { id: string; a: Entity; b: Entity; reasons: string[] }
export type MergeDecision = 'merge' | 'keep_separate';
export interface HindiSummary { text_hi: string; figures: { label: string; value: string }[] }
export interface Monitor { id: string; query: string; cadence: 'daily' | 'weekly' | 'monthly'; last_run: string }
export interface EntityRef { entity_id: string; label: string }
export interface MonitorDiff {
  monitor_id: string; from_run: string; to_run: string;
  added: EntityRef[]; removed: EntityRef[];
  changed: { entity_id: string; field: string; before: unknown; after: unknown }[];
}
export type ResolveAction = { type: 'accept' } | { type: 'pick'; value: unknown } | { type: 'override'; value: unknown };
