# Sub-Agent Collaboration Notes

- Stack adjusted: Repo uses Next.js 15 App Router with TypeScript (Zod schemas instead of Pydantic, TypeScript API routes instead of FastAPI, PostgreSQL / Supabase migration + MockStore fallback).
- GROQ_API_KEY is isolated strictly to server-side routes and `src/lib/groq/client.ts`. Zero exposure on client or git.
- Groq model default: `llama-3.3-70b-versatile` / `mixtral-8x7b-32768`.
