import type { ReactNode } from 'react';
import type { AsyncState } from '../useAsync';
import type { ClaimLabel, FieldStatus, ResolutionRule } from '../types';

export const RULE_LABEL: Record<ResolutionRule, string> = {
  most_recent: 'Most recent',
  most_credible: 'Most credible source',
  official_over_secondary: 'Official source over secondary',
  user_override: 'User override',
};
const LABEL_TEXT: Record<ClaimLabel, string> = { verified: 'Verified', estimated: 'Estimated', ai_inferred: 'AI-inferred' };
const STATUS_TEXT: Record<FieldStatus, string> = { agreed: 'Sources agree', conflict: 'Conflict', unresolved: 'Unresolved', no_data: 'No data' };

export const fmt = (v: unknown): string =>
  typeof v === 'string' ? v : v === undefined || v === null ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v);
export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export const SampleBadge = () => <span className="badge sample" title="Mock data — not real research output">Sample data</span>;
export const LabelBadge = ({ label }: { label: ClaimLabel }) => <span className={`badge ${label}`}>{LABEL_TEXT[label]}</span>;
export const StatusChip = ({ status }: { status: FieldStatus }) => <span className={`chip ${status}`}>{STATUS_TEXT[status]}</span>;

export function AsyncBoundary<T>({ state, isEmpty, emptyMessage, children }: {
  state: AsyncState<T>; isEmpty?: (d: T) => boolean; emptyMessage?: string; children: (d: T) => ReactNode;
}) {
  if (state.status === 'loading')
    return <div className="state" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" /> Loading…</div>;
  if (state.status === 'error')
    return <div className="state error" role="alert">{state.error} <button onClick={state.retry}>Retry</button></div>;
  const { data, sample } = state.result!;
  if (isEmpty?.(data)) return <div className="state" role="status">{emptyMessage ?? 'Nothing to show yet.'}</div>;
  return <>{sample && <p><SampleBadge /></p>}{children(data)}</>;
}
