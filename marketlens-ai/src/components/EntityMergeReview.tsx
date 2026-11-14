import { useState } from 'react';
import type { Entity, MergeCandidate, MergeDecision } from '../types';
import { fmt } from './common';
import { IdentifierBadge } from './IdentifierBadge';

// Only show a name when sources agree on it; otherwise fall back to the id (no silent pick).
const nameOf = (e: Entity) => (e.fields.name?.status === 'agreed' ? fmt(e.fields.name.claims[0]?.value) : e.id);

function Side({ e }: { e: Entity }) {
  return (
    <div className="side">
      <h4>{nameOf(e)}</h4>
      <p className="muted">{e.id}</p>
      {Object.entries(e.identifiers ?? {}).map(([k, v]) => v && <div key={k}><IdentifierBadge kind={k} id={v} /></div>)}
    </div>
  );
}

export function EntityMergeReview({ candidates, onDecide }: {
  candidates: MergeCandidate[]; onDecide: (id: string, d: MergeDecision) => Promise<void>;
}) {
  const [done, setDone] = useState<Record<string, MergeDecision>>({});
  const [err, setErr] = useState<string>();
  const decide = async (id: string, d: MergeDecision) => {
    setErr(undefined);
    try { await onDecide(id, d); setDone((s) => ({ ...s, [id]: d })); } catch (e) { setErr((e as Error).message); }
  };
  if (candidates.length === 0) return <p className="note" role="status">No possible duplicates to review.</p>;
  return (
    <div>
      {err && <p role="alert" className="err">{err}</p>}
      {candidates.map((c) => (
        <section key={c.id} className="card" aria-label={`Possible duplicate: ${nameOf(c.a)} and ${nameOf(c.b)}`}>
          <div className="cols"><Side e={c.a} /><Side e={c.b} /></div>
          <p className="muted">Why these may match: {c.reasons.join('; ')}</p>
          {done[c.id]
            ? <p role="status" className="ok">Decision saved: {done[c.id] === 'merge' ? 'merged' : 'kept separate'}.</p>
            : <div className="row"><button onClick={() => decide(c.id, 'merge')}>Merge</button>
                <button onClick={() => decide(c.id, 'keep_separate')}>Keep separate</button></div>}
        </section>
      ))}
    </div>
  );
}
