# CaseLab — Architecture Decisions & Interview Cheatsheet

This document provides a concise architectural guide and interview cheatsheet for **CaseLab (Case_Lab)**, explaining key technical choices in simple, direct language.

---

## 1. Project Overview & Business Value

| Property | Details |
|---|---|
| **Core Concept** | Academic case study lab platform enabling interactive business case analysis, collaborative frameworks, and structured problem-solving. |
| **Frontend Stack** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui components |
| **Backend & Database** | Supabase (PostgreSQL, Row Level Security, Realtime subscriptions, Edge Functions) |
| **State & Data Modeling** | Relational schemas for cases, teams, annotations, and quantitative evaluation matrices |

---

## 2. Key Architecture Decisions

1. **Row Level Security (RLS):**
   - Enforced database-level security policies in Supabase ensuring students and faculty can only read and mutate authorized case studies and team annotations.
2. **Real-Time Collaborative Analysis:**
   - Supabase WebSockets enable real-time synchronized editing and scoring across multi-member analysis teams.

---

## 3. Technical Interview Cheatsheet

### Q: Why did you choose Supabase with Next.js for CaseLab?
> **Answer:** "Academic case competitions require fast prototyping, robust authentication, and relational data integrity with fine-grained access control. Supabase provided instant PostgreSQL with Row Level Security (RLS) and real-time subscriptions, allowing the frontend to subscribe to collaborative case evaluations without managing bespoke WebSocket servers."
