# AI Agents System

Production-ready fixed agents for lead triage, sales replies, itineraries, and ops tasks. All agents run **server-side only**; `OPENAI_API_KEY` is never exposed to the client.

## Agents

| Agent | Purpose | Persisted to |
|-------|---------|--------------|
| **lead-triage** | Classify lead priority, recommended city/package, next step, questions to ask | `lead_ai.triage_json` |
| **sales-responder** | Draft WhatsApp + Email messages for admins | `lead_ai.messages_json` |
| **itinerary-generator** | Day-by-day logistics itinerary (city, days, tour) | `itineraries.content_json` |
| **ops-coordinator** | Operational task list (before arrival, day 1, etc.) | `lead_ai.ops_json` |
| **marketing-content** | (Future) Non-medical marketing copy | Admin-only, not yet wired |

## Safety rules (all agents)

- **No medical advice**, diagnosis, treatment instructions, or outcome promises.
- Use **only provided input** and known constants (e.g. cities: Medellín, Manizales). If something is missing, ask questions in the output.
- Output must be **strict JSON**; validated with Zod before persistence. Invalid output is rejected (502).

## How to run locally

1. Copy `.env.local.example` to `.env.local` and set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default `gpt-4.1-mini`).
2. Start the app: `npm run dev`.
3. Log in as admin and open a lead: `/admin/leads/[id]`.
4. Use the **AI Actions** card: **Run Triage**, **Generate Reply**, **Generate Itinerary**, **Generate Ops Tasks**.

## API endpoints (admin-only)

All require admin session (`requireAdmin()`) and are rate-limited per admin user.

- `POST /api/admin/ai/triage` — Body: `{ "lead_id": "uuid" }` → triage output, saved to `lead_ai.triage_json`.
- `POST /api/admin/ai/respond` — Body: `{ "lead_id": "uuid", "cta_url": "optional" }` → reply draft, saved to `lead_ai.messages_json`.
- `POST /api/admin/ai/itinerary` — Body: `{ "lead_id": "uuid", "city?", "start_date?", "days?", "includes_tour?" }` → itinerary, saved to `itineraries`.
- `POST /api/admin/ai/ops` — Body: `{ "lead_id": "uuid" }` → ops tasks, saved to `lead_ai.ops_json`.

## Example inputs / outputs

### Triage input (from lead record)

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "preferred_city": "Medellín",
  "desired_dates": null,
  "notes": "Interested in full package",
  "package_slug": "smile-medellin"
}
```

### Triage output (strict schema)

```json
{
  "priority": "medium",
  "recommended_city": "Medellín",
  "recommended_package_slug": "smile-medellin",
  "confidence": 0.8,
  "questions_to_ask": ["Preferred travel dates?"],
  "risk_flags": ["missing_dates"],
  "next_step": "request_more_info"
}
```

### Ops output (strict schema)

```json
{
  "tasks": [
    {"title": "Confirm arrival date", "due_relative": "before_arrival", "assignee": "coordinator", "notes": "Email or WhatsApp"}
  ],
  "summary": "One pre-arrival task."
}
```

## Architecture

- **Prompts**: Stored in `/agents/*.md`; loaded at runtime and cached in memory (`lib/ai/agent-loader.ts`).
- **Runner**: `lib/ai/run-agent.ts` — validates input, loads prompt, calls `runChatJson` (OpenAI), validates output with Zod, returns result.
- **OpenAI**: `lib/ai/openai.ts` — `runChatJson({ systemPrompt, userJson })` requests JSON-only response, retries once if parse fails.
- **Persistence**: `lib/ai/persist.ts` — `saveLeadAI(leadId, kind, payload)`, `saveItinerary(leadId, payload)` using service-role Supabase.
- **Logging**: Every agent run logs `request_id` via `createLogger(requestId)`.

## Tests

- `tests/ai-schemas.test.ts` — Validates sample outputs against Zod schemas.
- Run: `npm run test`
