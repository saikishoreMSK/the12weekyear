# The 12 Week Year

A mobile-first SaaS web app for executing long-term goals in focused 12-week cycles — daily habit
tracking, weekly reviews, a sprint dashboard, quarterly goals, and streak analytics.

> Backend APIs are designed to be consumed unchanged by a future React Native Android app.

## Stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, Framer Motion |
| Backend  | Spring Boot 3.5, Java 17, Spring Data JPA, Bean Validation (Spring Security + JWT in the Auth phase) |
| Database | PostgreSQL (Supabase) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the design decisions.

## Layout

```
frontend/   Next.js web app
backend/    Spring Boot REST API
docs/       Architecture & API contract
```

## Prerequisites
- Node.js 20+ and npm
- JDK 17+ (Maven is provided via the `mvnw` wrapper — no global install needed)
- A PostgreSQL database for running the API live (local, or Supabase) — not required for tests

## Running locally

### Backend
```bash
cd backend
cp .env.example .env          # then fill in DB credentials (or use the localhost defaults)
./mvnw spring-boot:run        # serves http://localhost:8080
```
Health check: `GET http://localhost:8080/api/v1/health`

Tests (no database required — uses in-memory H2):
```bash
cd backend && ./mvnw test
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm run dev                   # serves http://localhost:3000
```

## Status
**Phase 0 (Foundation) complete.** Built in phases — see `docs/ARCHITECTURE.md` for what's next.
