# MarketLens AI — Antigravity task: provenance, trust & monitoring components

## Role and context
You are extending the **MarketLens AI** frontend (React + TypeScript + Vite). MarketLens turns a plain-language question
(English or Hindi) into validated, source-backed datasets for Indian founders, analysts and small businesses.
The product promise is **trust and traceability**: every value must show where it came from.

Before writing code, inspect the repo.
- If `src/services/api.ts`, `src/types.ts` or a components folder already exist, **extend them in place and match their conventions**.
- If they don't exist, create them as specified below.
- The nine Stitch screens (landing, plan, progress, dashboard, explorer, source inspector, analytics, area explorer, reports)
  are the **visual reference**. Reuse their design tokens (see "Design system"). Do not redesign them.

## Non-negotiable data rules
1. **All data goes through `src/services/api.ts`.** No component calls `fetch` or imports mock data directly.
2. **Mock data is always labelled "Sample data"** (a visible badge wherever mock data is rendered). API results carry `sample: true`.
3. **Nothing is invented in the UI.** No computed scores, percentages, counts, hashes, "Live" or "100% traceable" claims that the API didn't return.
   Mapping a category to a visual (e.g. `fresh | aging | stale` → 3/2/1 meter segments) is fine; inventing numbers is not.
4. Show hashes and signatures **exactly as returned**. Do not truncate, reformat or "verify" them client-side.
5. If a field has no verified data, **never display a guessed value.**

## Types (`src/types.ts`)
```ts
type Claim = { value: unknown; source_name: string; source_url: string; collected_at: string;
               label: 'verified' | 'estimated' | 'ai_inferred' }
type FieldData = { claims: Claim[]; status: 'agreed' | 'conflict' | 'unresolved' | 'no_data';
  resolution?: { rule: 'most_recent' | 'most_credible' | 'official_over_secondary' | 'user_override';
                 chosen: unknown; overridden_by_user: boolean } }
type Entity = { id: string; fields: Record<string, FieldData>; freshness: 'fresh' | 'aging' | 'stale';
  trust_band: string; trust_reasons: TrustReason[];
  identifiers?: { gstin?: Identifier; cin?: Identifier; udyam?: Identifier; fssai?: Identifier } }  // Identifier = { value; format_valid: boolean }
type CoverageReport = { requested_fields: string[]; sources_checked: string[]; coverage: Record<string, string[]> }
type ResearchReceipt = { query: string; plan: string[]; sources: string[]; rules: string[];
                         collected_at: string; dataset_sha256: string; signature: string }
```
`trust_reasons` has no defined shape in the brief. Use `{ factor, detail, effect: 'raises' | 'lowers' | 'neutral' }`
and note this as an assumption in your summary. Add small supporting types for normalisation changes, merge candidates,
Hindi summary, monitors and diffs.

## Components (build one at a time)
| # | Component | Requirements |
|---|-----------|--------------|
| 1 | `FieldProvenancePanel` | Every field: each claim's value, label badge, source name, source link (`rel="noopener noreferrer"`, new-tab announced to screen readers), collected time. Conflict → show **all** values plus the rule used. Unresolved → say no value is selected. `no_data` → render `NoVerifiedData`. |
| 2 | `ConflictResolver` | Three actions: accept the rule's pick, pick another claim, or override with a typed value. Pending/success/error states; success announced via `aria-live`. |
| 3 | `CoverageGapReport` + `NoVerifiedData` | Table of requested fields × sources that returned data; fields with none are flagged. `NoVerifiedData` is the empty-answer state: explains nothing is shown because nothing verified exists. |
| 4 | `FreshnessMeter` + `StaleBanner` | Driven only by `entity.freshness`. Stale = `role="alert"`; aging = `role="status"`; fresh = no banner. |
| 5 | `TrustBreakdown` | Trust band, reasons with effect, and an explicit freshness line taken from the reason where `factor === 'freshness'`. If the API gave none, say so. |
| 6 | `NormalisationDiff` | Before/after table using `<del>`/`<ins>` plus the rule applied. Empty state. |
| 7 | `IdentifierBadge` | GSTIN / CIN / Udyam / FSSAI: "format valid / invalid". Tooltip text must be exactly **"Format check only, not registry verification"**; reachable by keyboard focus (`aria-describedby`, `role="tooltip"`). |
| 8 | `EntityMergeReview` | Side-by-side candidates, the API's reasons for the match, Merge / Keep separate. Never show an entity name unless sources agree on it. |
| 9 | `VoiceInputButton` | Web Speech API, `lang="hi-IN"`. If unsupported or permission denied: show a clear message; the text input must remain fully usable. |
| 10 | `HindiSummaryPanel` | Badge **"AI-generated summary"**. Any numbers shown come from API-provided `figures`, never from the model text. "Listen" via `speechSynthesis` picking a `hi*` voice; if none, disable and explain. |
| 11 | `ResearchReceiptModal` | Native `<dialog>` (focus trap, Esc). Query, plan, sources, rules, collected_at, `dataset_sha256`, `signature` exactly as returned, with copy buttons. |
| 12 | `MonitorList` + `DiffView` | Saved monitors; selecting one loads its diff (added / removed / changed with before → after). Empty states. |

## Cross-cutting requirements
- **Every new screen has loading, error (with Retry) and empty states.** Provide a dev control to simulate Normal / Loading / Error / Empty.
- **Accessibility:** full keyboard operation, visible focus, semantic headings/tables, `aria-live` for async results, `lang="hi"` on Hindi text,
  colour is never the only signal (always pair with text/icon), respect `prefers-reduced-motion`.
- **Graceful degradation:** voice features must never block the text path.
- No new dependencies unless unavoidable; say why if you add one.

## Design system (from the Stitch screens)
Dark theme. surface `#0c1321`, containers `#151b2a / #19202e / #232a39`, lowest `#070e1c`; emerald `#4edea3` (primary, verified),
teal `#5de6ff` (data), lavender `#d0bcff` (AI-inferred), amber `#f59e0b` (estimated / conflict), error `#ffb4ab`.
Fonts: Manrope (headings), Inter (UI), JetBrains Mono (ids, hashes, URLs). Flat surfaces, hairline borders, no neon, no gradients, no robot imagery.

## Cleanup pass on the existing Stitch screens
The generated screens contain claims the data rules forbid. Remove or wire them to the API:
hard-coded "Traceability: 100%", "BETA · LIVE", "99.4% CITATION ACCURACY", "LATENCY 420ms", "SHA-256 VERIFIED" / "BLOCK #…" footers,
"Corroboration: Grade AAA", "34 active statutory feeds", fabricated CIN / FSSAI / GSTIN values, and real company names paired with made-up registration numbers.
Also fix the stray character in "Farmley (Conn契)" and the "Chemsum" label (should describe a format check, not a checksum, unless the API says otherwise).

## Workflow
1. Plan briefly: list files you'll add or change.
2. Implement **one component at a time** against mock data in `api.ts`.
3. After each component: run the dev server, open it in the browser, exercise Normal / Loading / Error / Empty, and **show a screenshot**.
4. Run `npm run typecheck` and fix everything before moving on.
5. Finish with a summary: files changed, assumptions (e.g. `trust_reasons` shape), and anything you could not verify.

## Definition of done
- [ ] All 12 component groups exist, each with loading / error / empty states.
- [ ] No component touches mock data except through `api.ts`; every mock render shows "Sample data".
- [ ] `no_data` fields never show a value; conflicts always show both values and the rule.
- [ ] Hash and signature render byte-for-byte as returned.
- [ ] Voice input and Hindi playback fail gracefully with text alternatives.
- [ ] Keyboard-only walkthrough passes; typecheck is clean.
