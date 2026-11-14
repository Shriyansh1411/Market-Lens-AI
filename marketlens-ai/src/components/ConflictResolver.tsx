import { FormEvent, useId, useState } from 'react';
import type { FieldData, ResolveAction } from '../types';
import { RULE_LABEL, fmt, same } from './common';

export function ConflictResolver({ field, onResolve }: {
  field: FieldData; onResolve: (a: ResolveAction) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string>();
  const [err, setErr] = useState<string>();
  const [custom, setCustom] = useState('');
  const inputId = useId();
  const chosen = field.resolution?.chosen;

  const run = async (a: ResolveAction, done: string) => {
    setBusy(true); setErr(undefined); setOk(undefined);
    try { await onResolve(a); setOk(done); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (custom.trim()) run({ type: 'override', value: custom.trim() }, 'Override saved.');
  };

  return (
    <div className="resolver" role="group" aria-label="Resolve this conflict">
      {field.resolution && (
        <button disabled={busy} onClick={() => run({ type: 'accept' }, 'Resolution accepted.')}>
          Accept “{fmt(chosen)}” ({RULE_LABEL[field.resolution.rule]})
        </button>
      )}
      <fieldset>
        <legend>Pick a different value</legend>
        {field.claims.filter((c) => !same(c.value, chosen)).map((c, i) => (
          <button key={i} disabled={busy} onClick={() => run({ type: 'pick', value: c.value }, `Using ${fmt(c.value)}.`)}>
            Use {fmt(c.value)} from {c.source_name}
          </button>
        ))}
      </fieldset>
      <form onSubmit={submit}>
        <label htmlFor={inputId}>Override with your own value</label>
        <input id={inputId} value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button type="submit" disabled={busy || !custom.trim()}>Override</button>
      </form>
      <p role="status" aria-live="polite" className="ok">{ok}</p>
      {err && <p role="alert" className="err">{err}</p>}
    </div>
  );
}
