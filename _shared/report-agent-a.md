# Sub-Agent A Report: Backend Usage Tracking

## Files Owned & Implemented
- `src/lib/groq/types.ts`: TypeScript & Zod schemas for `TokenUsageRecord`, `TokenBudgetSummary`, and `TokenBudgetBreakdown`.
- `src/lib/groq/tracking.ts`: Persistent and in-memory usage tracking engine, atomic monthly aggregations, and seed management.
- `src/lib/groq/client.ts`: Thin wrapper around `groq-sdk` capturing actual token usage (`prompt_tokens`, `completion_tokens`, `total_tokens`) from the response payload.
- `supabase/migrations/00013_token_usage.sql`: PostgreSQL database migration for table `token_usage` with indexation and RLS policies.

## Key Changes
1. **Accurate Groq Token Extraction**: Since Groq does not provide a monthly budget API, tokens are counted strictly from the `chatCompletion.usage` field on every response.
2. **Database Migration**: Added `token_usage` table tracking `id`, `created_at`, `user_id`, `feature`, `model`, `prompt_tokens`, `completion_tokens`, and `total_tokens`.
3. **Multi-worker Safe Atomic Aggregation**: Aggregates records for the current calendar period (YYYY-MM).
4. **Resilient Local Fallback**: When `GROQ_API_KEY` is not configured, provides simulated pedagogical responses and tracks tokens transparently.

## Assumptions & TODOs
- Seeded default baseline reflects 420,000 / 500,000 tokens (84% warning state) per specification for initial preview.
- Supabase migration ready to apply in production (`00013_token_usage.sql`).
