import type { ReactNode } from 'react';
import type { CoverageReport, FieldData } from '../types';
import { LabelBadge, RULE_LABEL, StatusChip, fmt, fmtDate, same } from './common';
import { NoVerifiedData } from './CoverageGapReport';

export function FieldProvenancePanel({ name, field, coverage, children }: {
  name: string; field: FieldData; coverage?: CoverageReport; children?: ReactNode;
}) {
  if (field.status === 'no_data') return <NoVerifiedData field={name} coverage={coverage} />;
  const id = `prov-${name}`;
  const r = field.resolution;
  return (
    <section className="card" aria-labelledby={id}>
      <header className="row">
        <h3 id={id}>{name}</h3>
        <StatusChip status={field.status} />
      </header>
      <ul className="claims">
        {field.claims.map((c, i) => (
          <li key={i} className={r && same(r.chosen, c.value) ? 'chosen' : ''}>
            <strong>{fmt(c.value)}</strong> <LabelBadge label={c.label} />
            {r && same(r.chosen, c.value) && <span className="chip agreed">Selected</span>}
            <div className="muted">
              {c.source_name} ·{' '}
              <a href={c.source_url} target="_blank" rel="noopener noreferrer">
                source<span className="sr"> (opens in new tab)</span>
              </a>{' '}
              · <time dateTime={c.collected_at}>{fmtDate(c.collected_at)}</time>
            </div>
          </li>
        ))}
      </ul>
      {field.status === 'conflict' && (
        <p className="note" role="note">
          Sources disagree — all {field.claims.length} values are shown.{' '}
          {r ? <>Rule applied: <strong>{RULE_LABEL[r.rule]}</strong> → <strong>{fmt(r.chosen)}</strong>
            {r.overridden_by_user && ' (set by you)'}.</> : 'No rule has been applied, so no value is selected.'}
        </p>
      )}
      {field.status === 'unresolved' && (
        <p className="note" role="note">Unresolved — no value is selected. Review the claims above.</p>
      )}
      {children}
    </section>
  );
}
