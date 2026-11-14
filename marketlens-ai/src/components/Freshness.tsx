import type { Freshness } from '../types';

// Maps the API's category to meter segments. No numeric values are invented.
const SEGMENTS: Record<Freshness, number> = { fresh: 3, aging: 2, stale: 1 };

export function FreshnessMeter({ freshness }: { freshness: Freshness }) {
  return (
    <div className={`meter ${freshness}`} role="img" aria-label={`Freshness: ${freshness}`}>
      {[1, 2, 3].map((n) => <span key={n} className={n <= SEGMENTS[freshness] ? 'on' : ''} />)}
      <span className="txt">{freshness}</span>
    </div>
  );
}

export function StaleBanner({ freshness }: { freshness: Freshness }) {
  if (freshness === 'fresh') return null;
  return freshness === 'stale'
    ? <div className="banner stale" role="alert"><strong>Stale data.</strong> These values are out of date. Re-run the research before relying on them.</div>
    : <div className="banner aging" role="status"><strong>Aging data.</strong> Some values are getting old; consider refreshing.</div>;
}
