import { FormEvent, useState } from 'react';
import * as api from './services/api';
import { useAsync } from './useAsync';
import { AsyncBoundary } from './components/common';
import { FieldProvenancePanel } from './components/FieldProvenancePanel';
import { ConflictResolver } from './components/ConflictResolver';
import { CoverageGapReport, NoVerifiedData } from './components/CoverageGapReport';
import { FreshnessMeter, StaleBanner } from './components/Freshness';
import { TrustBreakdown } from './components/TrustBreakdown';
import { NormalisationDiff } from './components/NormalisationDiff';
import { IdentifierBadge } from './components/IdentifierBadge';
import { EntityMergeReview } from './components/EntityMergeReview';
import { VoiceInputButton } from './components/VoiceInputButton';
import { HindiSummaryPanel } from './components/HindiSummaryPanel';
import { ResearchReceiptModal } from './components/ResearchReceiptModal';
import { DiffView, MonitorList } from './components/MonitorList';
import type { Entity, MonitorDiff } from './types';

const noEntities = (d: Entity[]) => d.length === 0;

export function ProvenancePage() {
  const s = useAsync(() => api.listEntities());
  const cov = useAsync(() => api.getCoverage());
  return (
    <AsyncBoundary state={s} isEmpty={noEntities} emptyMessage="No entities returned.">
      {(entities) => (
        <>
          {entities.slice(0, 2).map((e) => (
            <div key={e.id}>
              <h2>{e.id}</h2>
              {Object.entries(e.fields).map(([name, f]) => (
                <FieldProvenancePanel key={name} name={name} field={f} coverage={cov.result?.data} />
              ))}
            </div>
          ))}
        </>
      )}
    </AsyncBoundary>
  );
}

export function ConflictPage() {
  const s = useAsync(() => api.listEntities());
  return (
    <AsyncBoundary state={s} isEmpty={noEntities} emptyMessage="No conflicts to resolve.">
      {(entities) => {
        const e = entities[0];
        const f = e.fields.price_inr;
        const resolve = async (a: Parameters<typeof api.resolveField>[2]) => {
          const r = await api.resolveField(e.id, 'price_inr', a);
          s.mutate((list) => list.map((x) => (x.id === e.id ? { ...x, fields: { ...x.fields, price_inr: r.data } } : x)));
        };
        return (
          <FieldProvenancePanel name="price_inr" field={f}>
            {(f.status === 'conflict' || f.status === 'unresolved') && <ConflictResolver field={f} onResolve={resolve} />}
          </FieldProvenancePanel>
        );
      }}
    </AsyncBoundary>
  );
}

export function CoveragePage() {
  const s = useAsync(() => api.getCoverage());
  return (
    <AsyncBoundary state={s} isEmpty={(d) => d.requested_fields.length === 0} emptyMessage="No coverage report returned.">
      {(report) => (<><CoverageGapReport report={report} /><NoVerifiedData field="shelf_life_days" coverage={report} /></>)}
    </AsyncBoundary>
  );
}

export function FreshnessPage() {
  const s = useAsync(() => api.listEntities());
  return (
    <AsyncBoundary state={s} isEmpty={noEntities}>
      {(entities) => entities.slice(0, 2).map((e) => (
        <section key={e.id} className="card"><h3>{e.id}</h3><StaleBanner freshness={e.freshness} /><FreshnessMeter freshness={e.freshness} /></section>
      ))}
    </AsyncBoundary>
  );
}

export function TrustPage() {
  const s = useAsync(() => api.listEntities());
  return <AsyncBoundary state={s} isEmpty={noEntities}>{(es) => es.slice(0, 2).map((e) => <TrustBreakdown key={e.id} entity={e} />)}</AsyncBoundary>;
}

export function NormalisationPage() {
  const s = useAsync(() => api.getNormalisationChanges());
  return <AsyncBoundary state={s} isEmpty={(d) => d.length === 0} emptyMessage="No values needed normalising.">{(c) => <NormalisationDiff changes={c} />}</AsyncBoundary>;
}

export function IdentifiersPage() {
  const s = useAsync(() => api.listEntities());
  return (
    <AsyncBoundary state={s} isEmpty={noEntities}>
      {(es) => (
        <section className="card">
          {Object.entries(es[0].identifiers ?? {}).map(([k, v]) => v && <div key={k}><IdentifierBadge kind={k} id={v} /></div>)}
        </section>
      )}
    </AsyncBoundary>
  );
}

export function MergePage() {
  const s = useAsync(() => api.getMergeCandidates());
  return (
    <AsyncBoundary state={s} isEmpty={(d) => d.length === 0} emptyMessage="No possible duplicates to review.">
      {(c) => <EntityMergeReview candidates={c} onDecide={async (id, d) => { await api.decideMerge(id, d); }} />}
    </AsyncBoundary>
  );
}

export function VoicePage() {
  const [text, setText] = useState('');
  const [lang, setLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true); };
  return (
    <form className="card" onSubmit={submit}>
      <label htmlFor="q">Your research question</label>
      <textarea id="q" lang={lang === 'hi-IN' ? 'hi' : 'en'} value={text} onChange={(e) => { setText(e.target.value); setSent(false); }} rows={3} />
      <div className="row">
        <label htmlFor="lang">Language</label>
        <select id="lang" value={lang} onChange={(e) => setLang(e.target.value as 'hi-IN' | 'en-IN')}>
          <option value="hi-IN">हिन्दी</option><option value="en-IN">English</option>
        </select>
        <VoiceInputButton lang={lang} onTranscript={(t) => setText(t)} />
      </div>
      <button type="submit" disabled={!text.trim()}>Run research</button>
      <p role="status" aria-live="polite" className="muted">{sent ? 'Demo only — nothing was sent.' : ''}</p>
    </form>
  );
}

export function HindiPage() {
  const s = useAsync(() => api.getHindiSummary());
  return <AsyncBoundary state={s} isEmpty={(d) => d === null} emptyMessage="No summary available.">{(d) => <HindiSummaryPanel summary={d!} />}</AsyncBoundary>;
}

export function ReceiptPage() {
  const s = useAsync(() => api.getReceipt());
  const [open, setOpen] = useState(false);
  return (
    <AsyncBoundary state={s} isEmpty={(d) => d === null} emptyMessage="No receipt available for this research.">
      {(r) => (<><button onClick={() => setOpen(true)}>View research receipt</button><ResearchReceiptModal receipt={r!} open={open} onClose={() => setOpen(false)} /></>)}
    </AsyncBoundary>
  );
}

export function MonitorsPage() {
  const s = useAsync(() => api.listMonitors());
  const [sel, setSel] = useState<string>();
  const diff = useAsync<MonitorDiff | null>(
    () => (sel ? api.getDiff(sel) : Promise.resolve({ data: null, sample: true })),
    [sel],
  );
  return (
    <AsyncBoundary state={s} isEmpty={(d) => d.length === 0}>
      {(m) => (
        <>
          <MonitorList monitors={m} selectedId={sel} onSelect={setSel} />
          {sel && <AsyncBoundary state={diff} isEmpty={(d) => d === null} emptyMessage="No diff available.">{(d) => <DiffView diff={d!} />}</AsyncBoundary>}
        </>
      )}
    </AsyncBoundary>
  );
}
