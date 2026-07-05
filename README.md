# The 12 Week Year

A mobile-first SaaS web app for executing long-term goals in focused **calendar quarters** — one
weekly goal per week, daily habit tracking, weekly reviews, a quarter dashboard, goal pacing, and
streak analytics. You "zoom" from the whole year down to a single day: **Dashboard → Quarter → Week
→ Habits → Analytics**.

> Backend APIs are stateless, JWT-authenticated, and designed to be consumed unchanged by a future
> React Native Android app.

## Stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, Framer Motion, TanStack Query |
| Backend  | Spring Boot 3.5, Java 17, Spring Data JPA, Bean Validation, Spring Security (stateless JWT), Flyway |
| Email    | Pluggable `EmailSender` — console (dev) or Resend (prod) for OTP verification & password reset |
| Database | PostgreSQL (Supabase), Flyway-versioned schema |

- **How the app works (sign-up → daily use → analytics, with examples):** [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- **Architecture & design decisions:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Features

- **Auth** — email/password with email **OTP verification** on sign-up and **OTP password reset**;
  stateless HS256 access tokens + rotating refresh tokens (reuse detection).
- **Year dashboard** — a 2×2 grid of the four calendar quarters, each with its state
  (upcoming / active / completed) and live score; prev/next-year navigation.
- **Calendar quarters** — Q1–Q4 keyed to the real calendar; dates, day-of-quarter, week (1–13) and
  state are all derived, never stored.
- **Weekly goals** — one goal per week (title + week), with pacing (ahead / on track / behind).
- **Habits** — user-scoped daily actions with a 7-day picker, optimistic toggles, streaks &
  consistency %, back-fill, and archive/resume.
- **Weekly reviews** — four reflection prompts per week (1–13), permanent.
- **Analytics** — activity streaks, best/worst weekday, and a month-grouped contribution heatmap.
- **Quote of the day** — a daily rotating motivational quote, dismissible.
- **Polish** — dark/light theme, Framer Motion animations, loading skeletons, installable PWA
  (manifest + icon).

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
**Web app complete.** All core features (auth, calendar quarters, weekly goals, habits, weekly
reviews, dashboard, analytics), the quarter pivot, quote of the day, email OTP, and the efficiency
pass (optimistic UI + debounced writes + TanStack Query read-cache) are implemented; the backend
suite is green. Remaining optional work: an offline service worker, recurring-pattern analytics over
weekly reviews, and scheduled cleanup of expired OTP rows. Next up (planned, not started): a **React
Native Android** app reusing the same REST API. See `docs/ARCHITECTURE.md` for the full build log.
