# MarketLens AI — provenance components (sample-data build)

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
```
- `ANTIGRAVITY_PROMPT.md` — paste into Antigravity to build/extend this in your real repo.
- `src/services/api.ts` — the only data entry point. All data is mock, flagged `sample: true`, shown as "Sample data".
- Use the **Simulate API state** dropdown (top right) to see Loading / Error / Empty on every screen.
- Mock identifiers, hashes and signatures are obviously fake placeholders, not real registrations or digests.
- Voice features need Chrome/Edge (Web Speech API) and a Hindi voice installed; otherwise the text fallbacks appear.
