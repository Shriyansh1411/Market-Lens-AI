import type { Entity } from '../types';
import { FreshnessMeter } from './Freshness';

const EFFECT = { raises: '▲ raises trust', lowers: '▼ lowers trust', neutral: '● no effect' } as const;

export function TrustBreakdown({ entity }: { entity: Entity }) {
  const fresh = entity.trust_reasons.find((r) => r.factor === 'freshness');
  return (
    <section className="card" aria-labelledby={`trust-${entity.id}`}>
      <header className="row">
        <h3 id={`trust-${entity.id}`}>Trust: <span className={`band ${entity.trust_band}`}>{entity.trust_band}</span></h3>
        <FreshnessMeter freshness={entity.freshness} />
      </header>
      <p className="muted" role="note">
        {fresh ? `Freshness effect: ${EFFECT[fresh.effect]} — ${fresh.detail}` : 'The API did not report a freshness effect for this entity.'}
      </p>
      {entity.trust_reasons.length === 0
        ? <p className="note">No trust reasons were returned.</p>
        : <ul>{entity.trust_reasons.map((r, i) => (
            <li key={i}><strong>{r.factor}</strong> — {r.detail} <span className={`eff ${r.effect}`}>{EFFECT[r.effect]}</span></li>
          ))}</ul>}
    </section>
  );
}
