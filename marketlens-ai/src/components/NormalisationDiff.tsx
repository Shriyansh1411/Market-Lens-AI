import type { NormalisationChange } from '../types';
import { fmt } from './common';

export function NormalisationDiff({ changes }: { changes: NormalisationChange[] }) {
  if (changes.length === 0) return <p className="note" role="status">No values needed normalising.</p>;
  return (
    <table>
      <caption className="sr">Values before and after normalisation</caption>
      <thead><tr><th scope="col">Field</th><th scope="col">Before</th><th scope="col">After</th><th scope="col">Rule</th></tr></thead>
      <tbody>
        {changes.map((c, i) => (
          <tr key={i}>
            <th scope="row">{c.field}</th>
            <td><del>{fmt(c.before)}</del></td>
            <td><ins>{fmt(c.after)}</ins></td>
            <td className="muted">{c.rule}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
