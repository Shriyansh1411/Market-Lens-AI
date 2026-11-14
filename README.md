MarketLens AI

From a simple question to actionable intelligence. Structured data with proof, and the honesty to say "no verified data found."

An AI-assisted data intelligence platform that turns a plain-language research request (English or Hindi) plus the sources you are permitted to use into a clean, validated, source-backed dataset you can explore, audit and export.

Core principle: the AI plans and explains; the data comes from real sources. Nothing is invented, collection is never simulated, and missing data is reported as missing.

1. The Problem

Anyone who needs business information in India (founders, analysts, recruiters, agencies, researchers) hits the same walls:

Research is slow. Hours go into jumping between websites, portals and PDFs for basic facts.
Data is scattered across places and formats, with no single structured view.
Data is messy. Duplicates, mixed currency notation (₹ / Rs / INR), lakh/crore, ambiguous dates, missing fields.
Nobody knows where a number came from. When two sources disagree, one is silently picked.
AI answers can be made up. General chatbots give confident but unsourced figures.
Collection tools are technical or risky. Scrapers need code and can break site terms.
India is under-served. Hindi-speaking users and small businesses can't afford analysts, and generic tools handle Indian identifiers and name variants (हल्दीराम / Haldiram's) poorly.
2. Our Solution

MarketLens AI runs the research workflow end to end, with the AI constrained to planning and wording while all numbers come from the data.

Step	What happens	Status
1. Ask	Type or speak (hi-IN) a request in English or Hindi	Built
2. Interpret	LLM fills a strict schema (topic, location, fields, conflict rule); rule-based parser if no key/failure	Built
3. Review plan	User edits topic, location, fields and conflict rule; permitted methods and limits shown	Built
4. Collect	Source adapters: CSV, JSON, Excel upload (modular, add your own)	Built (uploads)
5. Normalise (India layer)	₹/Rs/INR, lakh/crore, DD/MM/YYYY (ambiguity flagged), Hindi city names, ID format checks	Built
6. Clean & resolve	Location filter, dedupe, cross-source entity resolution (Devanagari transliteration + rapidfuzz, GSTIN match)	Built
7. Field-level provenance	Every claim keeps its source, timestamp, credibility and label (verified / estimated)	Built
8. TrustScore	Credibility, traceability, freshness, completeness, validation, with reasons	Built
9. Refuse when unsupported	"No verified data found" plus a coverage-gap report	Built
10. Explore	Dashboard: KPIs, Recharts, map, 3D trust view, search/filter, Source Inspector, conflict overrides	Built
11. Analyse	Price range/median, conflicts, trust distribution, EN + Hindi summary (numbers filled by server)	Built
12. Export + Receipt	CSV export and a server-signed Research Receipt	Built (CSV); PDF is roadmap
13. Monitor	Save a snapshot, re-run, see added / changed / removed	Built
3. What Makes It Unique
Trust layer
Claim-level provenance. Tracked per field, not per row: price from Source A and address from Source B are each traceable.
Conflict resolution engine. Both values are shown with the rule used (most_recent, most_credible, official_over_secondary). Ties are marked unresolved rather than guessed, and the user can override any claim.
Refuse-to-answer by design. No permitted source for a field means "no verified data found" and a coverage report, never AI filler.
Freshness decay. TrustScore is time-aware with per-field windows (price: fresh ≤30 days, aging ≤90; address: 365/730; default: 180/365).
Truth labelling. Verified vs Estimated is derived from the source's declared credibility (Official / Secondary / Estimated).
Transparent TrustScore. Weighted from credibility 25%, traceability 15%, freshness 25%, completeness 20%, validation 15%; each factor shows whether it raises or lowers trust and why.
LLM cannot invent numbers. The model writes text templates; the server fills all figures. Templates containing digits or unknown placeholders are rejected.
India-first layer
Format validation for GSTIN (with checksum), CIN, Udyam, FSSAI (format only; does not confirm an active registration).
Lakh / crore and ₹ / Rs / INR parsing, /- suffixes, Indian digit grouping.
DD/MM/YYYY dates with ambiguity flags.
Hindi / Hinglish name matching: "Haldiram's", "हल्दीराम" and "Haldirams Pvt Ltd" resolve to one entity, with the evidence of each merge shown.
Hindi CSV headers (नाम, कीमत, पता, शहर ...) and Hindi city names.
Product layer
Voice-first Hindi: browser speech recognition for input and Hindi speech output for summaries.
Research Receipt: SHA-256 of the exact exported CSV plus a server-side HMAC-SHA256 signature over the query, plan, source hashes, rules, overrides and timestamp.
Monitor mode: snapshots stored server-side with price-change diff.
Editable plan, honest progress, permission-first collection (only sources you provide).
4. How It Compares

Typical characteristics of the alternatives, not claims about any single product.

	Manual research	General chatbots	Web scrapers	Market reports	MarketLens AI
Natural-language input	No	Yes	No	No	Yes (EN + HI, voice)
Structured exportable dataset	Effort-heavy	Rarely	Yes	Fixed	Yes
Source per record	Manual	Often missing	Yes	Limited	Source per field
Shows source disagreement	Manual	No	No	No	Yes, with rule
Declines when data missing	N/A	Often fills the gap	N/A	N/A	Yes, with gap report
Time-aware trust	No	No	No	Static	Yes
India IDs and name matching	Manual	Limited	DIY	Varies	Built in
Audit trail for exports	No	No	No	No	Research Receipt

Chatbots give answers without proof, scrapers give data without guardrails, reports are costly and static. MarketLens AI gives structured data with proof, and says so when proof is missing.

5. Architecture
Backend: FastAPI
server-side key
/api (X-Client-Id orSupabase JWT)
Frontend: React + TS + Tailwind
Ask / Plan / Dashboard /Inspector / Receipt /Monitors
Recharts - Leaflet map -react-three-fiber 3D
Web Speech API hi-IN
User: text or Hindi voice
Security: validation, ratelimit, owner scoping,headers
Source adapters: CSV /JSON / XLSX
Pipeline: pandas clean -rapidfuzz merge - resolve -TrustScore
LLM client: forced tool-use+ Pydantic schema +fallback
Receipts: SHA-256 + HMACsignature
PostgreSQL / Supabase:JSONB claims
Anthropic API
Request workflow
LLM
Backend
Frontend
User
LLM
Backend
Frontend
User
Upload sources / load sample
POST /api/sources (validated, hashed, stored)
"Find healthy snack brands in Delhi..."
POST /api/plan
structured call (schema-forced)
plan JSON (validated; else rules fallback)
editable plan
Run research
POST /api/research/run
filter, clean, merge, resolve, score
entities with field-level claims, KPIs, coverage
override a conflict
POST /api/research/{id}/override (re-resolve from stored claims)
Generate receipt
POST /api/receipts (sha256(CSV) + HMAC)
Verify
POST /api/receipts/verify
Data model (field-level provenance, stored as JSON)
json
{
  "id": 2,
  "display": "Haldiram's",
  "fields": {
    "price_inr": {
      "status": "conflict",
      "claims": [
        {"value": 120, "source": "sample_official.csv", "at": "2026-11-10T00:00:00", "cred_class": "official", "label": "verified"},
        {"value": 135, "source": "sample_retail.csv",   "at": "2026-11-13T00:00:00", "cred_class": "secondary", "label": "verified"}
      ],
      "resolution": {"rule": "most_recent", "chosen": 135, "by_user": false},
      "chosen_index": 1
    }
  }
}
6. Tech Stack
Frontend: React, TypeScript, Tailwind CSS, Recharts, Three.js (react-three-fiber), Leaflet
Backend: Python FastAPI, Pandas, rapidfuzz, modular source adapters
Database: PostgreSQL / Supabase (SQLite for local dev); field-level claims as JSON/JSONB
AI: LLM for interpretation, planning and explanations; forced tool-use structured output, Pydantic schema validation, deterministic fallback
Voice: browser speech recognition and synthesis (hi-IN)
Integrity: SHA-256 dataset hashing + server-side HMAC-SHA256 receipt signature
Security: server-side keys, strict input validation, rate limiting, per-owner data access
7. Security
API keys and the signing key exist only in server environment variables; /api/health exposes booleans only.
Every row has an owner_id and every query filters on it. Anonymous owners are random UUIDs (bearer-style); Supabase JWT supported for real accounts (SUPABASE_JWT_SECRET, REQUIRE_AUTH).
Pydantic extra="forbid", UUID-pattern path params, 5 MB streamed upload cap, 50k-row cap, 25 sources/user.
Rate limits (per IP, env-tunable): default 120/min, uploads and runs 20/min, LLM 15/min.
CORS allow-list, nosniff / frame-deny / CSP headers, CSV formula-injection neutralised, generic 500s, API docs off and signing key mandatory when APP_ENV=production.
8. Run Locally

Requires Python 3.10 - 3.13 (3.12 recommended; very new Python versions lack prebuilt wheels) and Node 18+.

powershell
# Terminal 1: backend
cd backend
py -3.12 -m venv .venv            # macOS/Linux: python3.12 -m venv .venv
.venv\Scripts\Activate.ps1        # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
copy .env.example .env            # macOS/Linux: cp .env.example .env
uvicorn app.main:app --reload     # http://localhost:8000  (API docs: /docs)
pytest                            # 12 tests

# Terminal 2: frontend
cd frontend
npm install
npm run dev                       # http://localhost:5173

Open http://localhost:5173, then Load sample data, Make plan, Run research. Add ANTHROPIC_API_KEY to backend/.env to switch from the rule-based planner to the AI planner.

Docker: cp .env.example .env (set RECEIPT_SIGNING_KEY), then docker compose up --build and open http://localhost:8080. Supabase: set DATABASE_URL to your connection string; tables auto-create, or run db/schema.sql (enables RLS with no public policies). Deploy: frontend on Vercel (root frontend, env VITE_API_URL), backend on Render/Railway (root backend, APP_ENV=production, RECEIPT_SIGNING_KEY, DATABASE_URL, CORS_ORIGINS), database on Supabase.

9. API Overview
Endpoint	Purpose
POST /api/sources, /sources/sample, GET/PATCH/DELETE /api/sources	Manage sources and their credibility
POST /api/plan	Request to editable plan (LLM or rules)
POST /api/research/run, GET /api/research/{id}	Run and fetch research
POST /api/research/{id}/override	Choose a claim in a conflict
GET /api/research/{id}/export.csv	Deterministic CSV (the hashed dataset)
POST /api/research/{id}/summary, /entities/{eid}/explain	EN + Hindi explanations (numbers filled server-side)
POST /api/receipts, /receipts/verify	Issue and verify Research Receipts
POST /api/monitors/snapshots, /monitors/compare	Monitor mode
10. Principles and Honest Limits
No fabricated market sizes, competitor counts, profits or prices. Every record comes from a source you provided or is labelled SAMPLE DATA.
Every insight links to evidence or a stated assumption; errors are shown honestly.
Identifier checks confirm format, not that a registration is active.
The Research Receipt proves the export was not altered since issue, not that the sources are correct.
Map positions are approximate (CSV lat/lng, else built-in Delhi-NCR pincode table, else city centroid) and labelled so.
Rate limiter is in-memory (use Redis for multiple replicas). Schema uses create_all; add Alembic before evolving it.
11. Roadmap (not built yet)

Official-dataset and public-API adapters, PDF export, an "AI-inferred" label for model-derived values, district/state standardisation and more Indian pincodes, entity-resolution review screen, hyperlocal Area mode, scheduled monitor alerts, direct registry integrations (subject to access and terms).

12. Market Relevance

Who needs it: founders validating ideas and competitors; analysts and agencies who must defend their numbers; recruiters, event organisers, researchers and small businesses without an analyst budget. Why now: open data is growing but hard for non-technical users to collect and reconcile, and trust in AI-generated facts is a live concern, so verifiable, auditable output is a real differentiator. (Market-size figures intentionally omitted. Add a cited source before putting any number in a pitch.)

13. Project Layout
backend/app/{main,config,db,models,schemas,security}.py
backend/app/routers/{sources,research,receipts,monitors}.py
backend/app/services/{adapters,normalize,pipeline,geo,llm,planner,insights,receipts}.py
backend/tests/        frontend/src/{pages,components,lib}
db/schema.sql         docker-compose.yml# Market-Lens-AI
