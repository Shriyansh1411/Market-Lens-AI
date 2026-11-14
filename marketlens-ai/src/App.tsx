import { useEffect, useState } from 'react';
import { MockMode, getMockMode, setMockMode } from './services/api';
import * as P from './pages';

const PAGES = [
  { id: 'provenance', title: 'Field provenance', C: P.ProvenancePage },
  { id: 'conflict', title: 'Conflict resolver', C: P.ConflictPage },
  { id: 'coverage', title: 'Coverage gaps / no verified data', C: P.CoveragePage },
  { id: 'freshness', title: 'Freshness & stale banner', C: P.FreshnessPage },
  { id: 'trust', title: 'Trust breakdown', C: P.TrustPage },
  { id: 'normalisation', title: 'Normalisation diff', C: P.NormalisationPage },
  { id: 'identifiers', title: 'Identifier badges', C: P.IdentifiersPage },
  { id: 'merge', title: 'Entity merge review', C: P.MergePage },
  { id: 'voice', title: 'Voice input', C: P.VoicePage },
  { id: 'hindi', title: 'Hindi summary', C: P.HindiPage },
  { id: 'receipt', title: 'Research receipt', C: P.ReceiptPage },
  { id: 'monitors', title: 'Monitors & diff', C: P.MonitorsPage },
];

export default function App() {
  const [id, setId] = useState(location.hash.slice(1) || PAGES[0].id);
  const [mode, setMode] = useState<MockMode>(getMockMode());
  useEffect(() => { const h = () => setId(location.hash.slice(1) || PAGES[0].id); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h); }, []);
  const page = PAGES.find((p) => p.id === id) ?? PAGES[0];
  const Page = page.C;
  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <strong>MarketLens AI</strong>
        <label>Simulate API state:{' '}
          <select value={mode} onChange={(e) => { const m = e.target.value as MockMode; setMockMode(m); setMode(m); }}>
            <option value="normal">Normal</option><option value="loading">Loading</option>
            <option value="error">Error</option><option value="empty">Empty</option>
          </select>
        </label>
      </header>
      <nav aria-label="Components"><ul>{PAGES.map((p) => (
        <li key={p.id}><a href={`#${p.id}`} aria-current={p.id === page.id ? 'page' : undefined}>{p.title}</a></li>))}</ul></nav>
      <main id="main" tabIndex={-1}><h1>{page.title}</h1><Page key={`${page.id}-${mode}`} /></main>
    </div>
  );
}
