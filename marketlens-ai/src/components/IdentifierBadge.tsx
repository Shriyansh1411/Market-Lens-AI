import { useId } from 'react';
import type { Identifier } from '../types';

export function IdentifierBadge({ kind, id }: { kind: string; id: Identifier }) {
  const tip = useId();
  return (
    <span className="idbadge">
      <button type="button" className={`badge ${id.format_valid ? 'verified' : 'bad'}`} aria-describedby={tip}>
        {kind.toUpperCase()} {id.value} — {id.format_valid ? 'format valid' : 'format invalid'}
      </button>
      <span role="tooltip" id={tip} className="tip">Format check only, not registry verification</span>
    </span>
  );
}
