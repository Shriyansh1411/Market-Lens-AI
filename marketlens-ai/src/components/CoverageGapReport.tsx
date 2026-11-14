import type { CoverageReport } from '../types';

export function CoverageGapReport({ report, field }: { report?: CoverageReport; field?: string }) {
  if (!report || report.requested_fields.length === 0)
    return <p className="note" role="status">No coverage report was returned for this request.</p>;
  const fields = field ? [field] : report.requested_fields;
  return (
    <section className="card" aria-labelledby="cov-h">
      <h3 id="cov-h">Coverage report</h3>
      <p className="muted">Sources checked: {report.sources_checked.join(', ') || 'none reported'}</p>
      <table>
        <caption className="sr">Which sources returned data for each requested field</caption>
        <thead><tr><th scope="col">Field</th><th scope="col">Sources with data</th></tr></thead>
        <tbody>
          {fields.map((f) => {
            const found = report.coverage[f] ?? [];
            return (
              <tr key={f}>
                <th scope="row">{f}</th>
                <td>{found.length ? found.join(', ') : <span className="gap">No source returned data</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

/** Empty-answer state. Never shows a guessed value. */
export function NoVerifiedData({ field, coverage }: { field: string; coverage?: CoverageReport }) {
  return (
    <section className="card no-data" role="status" aria-label={`No verified data for ${field}`}>
      <h3>No verified data for “{field}”</h3>
      <p>None of the sources we checked returned a value for this field, so nothing is shown. We don’t estimate or guess.</p>
      <CoverageGapReport report={coverage} field={field} />
    </section>
  );
}
