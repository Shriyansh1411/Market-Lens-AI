import type { Monitor, MonitorDiff } from '../types';
import { fmt, fmtDate } from './common';

export function MonitorList({ monitors, selectedId, onSelect }: { monitors: Monitor[]; selectedId?: string; onSelect: (id: string) => void }) {
  if (monitors.length === 0) return <p className="note" role="status">No monitors yet. Save a research query to watch it for changes.</p>;
  return (
    <ul className="monitors" aria-label="Saved monitors">
      {monitors.map((m) => (
        <li key={m.id}>
          <button onClick={() => onSelect(m.id)} aria-current={m.id === selectedId ? 'true' : undefined}>
            <strong>{m.query}</strong>
            <span className="muted"> · {m.cadence} · last run <time dateTime={m.last_run}>{fmtDate(m.last_run)}</time></span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function DiffView({ diff }: { diff: MonitorDiff }) {
  const none = !diff.added.length && !diff.removed.length && !diff.changed.length;
  return (
    <section className="card" aria-label="Changes since last run">
      <p className="muted">{fmtDate(diff.from_run)} → {fmtDate(diff.to_run)}</p>
      {none && <p role="status">No changes between these runs.</p>}
      {diff.added.length > 0 && <><h4>Added</h4><ul>{diff.added.map((e) => <li key={e.entity_id} className="add">+ {e.label}</li>)}</ul></>}
      {diff.removed.length > 0 && <><h4>Removed</h4><ul>{diff.removed.map((e) => <li key={e.entity_id} className="del">− {e.label}</li>)}</ul></>}
      {diff.changed.length > 0 && <><h4>Changed</h4><ul>{diff.changed.map((c, i) => (
        <li key={i}>{c.entity_id} · {c.field}: <del>{fmt(c.before)}</del> → <ins>{fmt(c.after)}</ins></li>))}</ul></>}
    </section>
  );
}
