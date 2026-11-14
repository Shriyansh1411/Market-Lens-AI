import { useEffect, useRef, useState } from 'react';
import type { ResearchReceipt } from '../types';

function Copy({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); } catch { setDone(false); } }}
      aria-label={`Copy ${label}`}>{done ? 'Copied' : 'Copy'}</button>
  );
}

export function ResearchReceiptModal({ receipt, open, onClose }: { receipt: ResearchReceipt; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="modal" aria-labelledby="rcpt-h" onClose={onClose}>
      <h2 id="rcpt-h">Research receipt</h2>
      <dl>
        <dt>Query</dt><dd>{receipt.query}</dd>
        <dt>Plan</dt><dd><ol>{receipt.plan.map((p, i) => <li key={i}>{p}</li>)}</ol></dd>
        <dt>Sources</dt><dd><ul>{receipt.sources.map((s, i) => <li key={i}>{s}</li>)}</ul></dd>
        <dt>Rules</dt><dd><ul>{receipt.rules.map((s, i) => <li key={i}>{s}</li>)}</ul></dd>
        <dt>Collected at</dt><dd><code>{receipt.collected_at}</code></dd>
        <dt>Dataset SHA-256</dt><dd><code className="wrap">{receipt.dataset_sha256}</code> <Copy text={receipt.dataset_sha256} label="dataset hash" /></dd>
        <dt>Signature</dt><dd><code className="wrap">{receipt.signature}</code> <Copy text={receipt.signature} label="signature" /></dd>
      </dl>
      <p className="muted">Hash and signature are shown exactly as returned by the API. This screen does not verify the signature.</p>
      <button autoFocus onClick={onClose}>Close</button>
    </dialog>
  );
}
