/**
 * The ONLY module the UI may call for data. Everything returned here is MOCK data and is
 * flagged `sample: true`; the UI must show a "Sample data" label for it.
 * Replace the bodies with real fetch() calls later — signatures stay the same.
 */
import type {
  CoverageReport, Entity, FieldData, HindiSummary, MergeCandidate, MergeDecision, Monitor,
  MonitorDiff, NormalisationChange, ResearchReceipt, ResolveAction,
} from '../types';

export type MockMode = 'normal' | 'loading' | 'error' | 'empty';
let mode: MockMode = 'normal';
export const setMockMode = (m: MockMode) => { mode = m; };
export const getMockMode = () => mode;

export interface ApiResult<T> { data: T; sample: boolean }
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

async function respond<T>(normal: () => T, empty: T): Promise<ApiResult<T>> {
  if (mode === 'loading') return new Promise<ApiResult<T>>(() => {}); // never resolves
  await wait();
  if (mode === 'error') throw new Error('Sample error: the research API could not be reached.');
  return { data: structuredClone(mode === 'empty' ? empty : normal()), sample: true };
}

/* ------------------------- sample store ------------------------- */
const REQUESTED = ['name', 'price_inr', 'pack_size_g', 'shelf_life_days'];

const store: Record<string, Entity> = {
  ent_sample_1: {
    id: 'ent_sample_1',
    freshness: 'aging',
    trust_band: 'medium',
    trust_reasons: [
      { factor: 'sources', detail: 'Two independent sources returned data.', effect: 'raises' },
      { factor: 'freshness', detail: 'Oldest claim was collected several days ago.', effect: 'lowers' },
      { factor: 'conflict', detail: 'Price differs between sources.', effect: 'lowers' },
    ],
    identifiers: {
      gstin: { value: '29AAAAA0000A1Z5', format_valid: true },
      fssai: { value: '12345678901234', format_valid: true },
      udyam: { value: 'UDYAM-XX-00-000000', format_valid: false },
    },
    fields: {
      name: { status: 'agreed', claims: [
        { value: 'Sample Millet Bites 100g', source_name: 'Sample Marketplace A', source_url: 'https://example.com/sample/a/1', collected_at: '2026-11-09T09:30:00Z', label: 'verified' },
        { value: 'Sample Millet Bites 100g', source_name: 'Sample Quick-commerce B', source_url: 'https://example.com/sample/b/1', collected_at: '2026-11-12T07:10:00Z', label: 'verified' },
      ] },
      price_inr: {
        status: 'conflict',
        claims: [
          { value: 180, source_name: 'Sample Marketplace A', source_url: 'https://example.com/sample/a/1', collected_at: '2026-11-09T09:30:00Z', label: 'verified' },
          { value: 185, source_name: 'Sample Quick-commerce B', source_url: 'https://example.com/sample/b/1', collected_at: '2026-11-12T07:10:00Z', label: 'estimated' },
        ],
        resolution: { rule: 'most_recent', chosen: 185, overridden_by_user: false },
      },
      pack_size_g: { status: 'agreed', claims: [
        { value: 100, source_name: 'Sample Marketplace A', source_url: 'https://example.com/sample/a/1', collected_at: '2026-11-09T09:30:00Z', label: 'verified' },
      ] },
      shelf_life_days: { status: 'no_data', claims: [] },
    },
  },
  ent_sample_2: {
    id: 'ent_sample_2',
    freshness: 'stale',
    trust_band: 'low',
    trust_reasons: [
      { factor: 'freshness', detail: 'All claims are older than the freshness window.', effect: 'lowers' },
      { factor: 'sources', detail: 'Only one source returned data.', effect: 'lowers' },
    ],
    fields: {
      name: { status: 'agreed', claims: [
        { value: 'Sample Roasted Makhana 100g', source_name: 'Sample Marketplace A', source_url: 'https://example.com/sample/a/2', collected_at: '2026-08-01T10:00:00Z', label: 'estimated' },
      ] },
      price_inr: { status: 'unresolved', claims: [
        { value: 145, source_name: 'Sample Marketplace A', source_url: 'https://example.com/sample/a/2', collected_at: '2026-08-01T10:00:00Z', label: 'estimated' },
        { value: 150, source_name: 'Sample Brand Site C', source_url: 'https://example.com/sample/c/2', collected_at: '2026-08-02T10:00:00Z', label: 'ai_inferred' },
      ] },
      pack_size_g: { status: 'no_data', claims: [] },
      shelf_life_days: { status: 'no_data', claims: [] },
    },
  },
  ent_sample_3: {
    id: 'ent_sample_3', freshness: 'fresh', trust_band: 'medium', trust_reasons: [],
    identifiers: { gstin: { value: '29AAAAA0000A1Z5', format_valid: true } },
    fields: { name: { status: 'agreed', claims: [
      { value: 'Sample Millet Bites 100 g', source_name: 'Sample Brand Site C', source_url: 'https://example.com/sample/c/3', collected_at: '2026-11-13T08:00:00Z', label: 'verified' },
    ] } },
  },
};

const coverage: CoverageReport = {
  requested_fields: REQUESTED,
  sources_checked: ['Sample Marketplace A', 'Sample Quick-commerce B', 'Sample Registry C'],
  coverage: {
    name: ['Sample Marketplace A', 'Sample Quick-commerce B'],
    price_inr: ['Sample Marketplace A', 'Sample Quick-commerce B'],
    pack_size_g: ['Sample Marketplace A'],
    shelf_life_days: [],
  },
};
const emptyCoverage: CoverageReport = { requested_fields: [], sources_checked: [], coverage: {} };

const changes: NormalisationChange[] = [
  { entity_id: 'ent_sample_1', field: 'pack_size_g', before: '100 gm', after: 100, rule: 'Unit normalised to grams' },
  { entity_id: 'ent_sample_1', field: 'price_inr', before: '₹ 180/-', after: 180, rule: 'Currency symbol and suffix removed' },
];

const mergeCandidates: MergeCandidate[] = [
  { id: 'mc_1', a: store.ent_sample_1, b: store.ent_sample_3, reasons: ['Same GSTIN format and value', 'Names differ only in spacing'] },
];

const hindi: HindiSummary = {
  text_hi: 'नमूना डेटा के अनुसार, "Sample Millet Bites 100g" की कीमत दो स्रोतों में ₹180 और ₹185 दर्ज है। शेल्फ लाइफ के लिए कोई सत्यापित डेटा नहीं मिला।',
  figures: [{ label: 'कीमत (Sample Marketplace A)', value: '₹180' }, { label: 'कीमत (Sample Quick-commerce B)', value: '₹185' }],
};

const receipt: ResearchReceipt = {
  query: 'Healthy snack brands in India under ₹500 (sample)',
  plan: ['Parse request', 'Query sample sources', 'Normalise units', 'Resolve conflicts by rule'],
  sources: ['Sample Marketplace A', 'Sample Quick-commerce B', 'Sample Registry C'],
  rules: ['most_recent', 'official_over_secondary'],
  collected_at: '2026-11-12T07:10:00Z',
  dataset_sha256: 'SAMPLE_HASH_NOT_A_REAL_DIGEST',
  signature: 'SAMPLE_SIGNATURE_NOT_VERIFIABLE',
};

const monitors: Monitor[] = [
  { id: 'mon_1', query: 'Healthy snack brands in India under ₹500', cadence: 'weekly', last_run: '2026-11-12T06:00:00Z' },
  { id: 'mon_2', query: 'Solar equipment tenders', cadence: 'daily', last_run: '2026-11-13T06:00:00Z' },
];
const diffs: Record<string, MonitorDiff> = {
  mon_1: { monitor_id: 'mon_1', from_run: '2026-11-05T06:00:00Z', to_run: '2026-11-12T06:00:00Z',
    added: [{ entity_id: 'ent_sample_3', label: 'Sample Millet Bites 100 g' }], removed: [],
    changed: [{ entity_id: 'ent_sample_1', field: 'price_inr', before: 180, after: 185 }] },
  mon_2: { monitor_id: 'mon_2', from_run: '2026-11-12T06:00:00Z', to_run: '2026-11-13T06:00:00Z', added: [], removed: [], changed: [] },
};

/* ----------------------------- API ----------------------------- */
export const listEntities = () => respond(() => Object.values(store), [] as Entity[]);
export const getCoverage = () => respond(() => coverage, emptyCoverage);
export const getNormalisationChanges = () => respond(() => changes, [] as NormalisationChange[]);
export const getMergeCandidates = () => respond(() => mergeCandidates, [] as MergeCandidate[]);
export const getHindiSummary = () => respond<HindiSummary | null>(() => hindi, null);
export const getReceipt = () => respond<ResearchReceipt | null>(() => receipt, null);
export const listMonitors = () => respond(() => monitors, [] as Monitor[]);
export const getDiff = (monitorId: string) => respond<MonitorDiff | null>(() => diffs[monitorId] ?? null, null);

export async function resolveField(entityId: string, field: string, action: ResolveAction): Promise<ApiResult<FieldData>> {
  await wait(250);
  if (mode === 'error') throw new Error('Sample error: could not save your decision.');
  const f = store[entityId].fields[field];
  if (action.type !== 'accept') {
    f.resolution = { rule: 'user_override', chosen: action.value, overridden_by_user: true };
  }
  return { data: structuredClone(f), sample: true };
}

export async function decideMerge(candidateId: string, _decision: MergeDecision): Promise<ApiResult<{ id: string }>> {
  await wait(250);
  if (mode === 'error') throw new Error('Sample error: could not save your decision.');
  return { data: { id: candidateId }, sample: true };
}
