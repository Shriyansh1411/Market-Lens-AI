import { useEffect, useState } from 'react';
import type { HindiSummary } from '../types';

export function HindiSummaryPanel({ summary }: { summary: HindiSummary }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null | undefined>(undefined); // undefined = still checking
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { setVoice(null); return; }
    const synth = window.speechSynthesis;
    const pick = () => {
      const vs = synth.getVoices();
      if (vs.length === 0) return;
      setVoice(vs.find((v) => v.lang.toLowerCase().startsWith('hi')) ?? null);
    };
    pick();
    synth.addEventListener('voiceschanged', pick);
    const t = setTimeout(() => setVoice((v) => (v === undefined ? null : v)), 1500);
    return () => { synth.removeEventListener('voiceschanged', pick); clearTimeout(t); synth.cancel(); };
  }, []);

  const listen = () => {
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(summary.text_hi);
    u.lang = 'hi-IN'; if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    setSpeaking(true); synth.speak(u);
  };

  return (
    <section className="card" aria-labelledby="hi-h">
      <header className="row"><h3 id="hi-h">हिन्दी सारांश</h3><span className="badge ai_inferred">AI-generated summary</span></header>
      <p lang="hi" className="hindi">{summary.text_hi}</p>
      {summary.figures.length > 0 && (
        <dl className="figures">
          {summary.figures.map((f, i) => <div key={i}><dt lang="hi">{f.label}</dt><dd>{f.value}</dd></div>)}
        </dl>
      )}
      <p className="muted">Figures above come from the research data, not from the AI summary.</p>
      <button onClick={listen} disabled={!voice} aria-pressed={speaking}>{speaking ? '■ Stop' : '🔊 Listen'}</button>
      {voice === null && <p className="note" role="status">No Hindi voice is available on this device, so audio can’t play. You can read the text above.</p>}
    </section>
  );
}
