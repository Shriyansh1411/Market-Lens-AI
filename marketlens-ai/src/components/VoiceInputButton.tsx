import { useEffect, useRef, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function VoiceInputButton({ onTranscript, lang = 'hi-IN' }: { onTranscript: (t: string) => void; lang?: string }) {
  const Ctor: any = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;
  const [listening, setListening] = useState(false);
  const [msg, setMsg] = useState<string>();
  const rec = useRef<any>(null);
  useEffect(() => () => rec.current?.abort?.(), []);

  if (!Ctor)
    return <p className="note" role="status">Voice input isn’t supported in this browser. Please type your question instead.</p>;

  const toggle = () => {
    if (listening) { rec.current?.stop(); return; }
    const r = new Ctor();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e: any) => onTranscript(e.results[0][0].transcript);
    r.onerror = (e: any) => setMsg(
      e.error === 'not-allowed' ? 'Microphone permission was denied. Please type your question.'
      : e.error === 'language-not-supported' ? 'Hindi voice input isn’t available here. Please type your question.'
      : 'Voice input failed. Please type your question.');
    r.onend = () => setListening(false);
    rec.current = r; setMsg(undefined);
    try { r.start(); setListening(true); } catch { setMsg('Could not start voice input. Please type your question.'); }
  };

  return (
    <span>
      <button type="button" onClick={toggle} aria-pressed={listening}>
        {listening ? '■ Stop listening' : '🎤 Speak (हिन्दी)'}
      </button>
      <span role="status" aria-live="polite" className="muted"> {listening ? 'Listening…' : msg}</span>
    </span>
  );
}
