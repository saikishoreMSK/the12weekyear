# Architecture — The 12 Week Year

This document records the structural decisions. It is the source of truth for *why* the code is
laid out the way it is. Update it whenever a decision changes.

## Repository topology

```
The12WeekYear/
├── frontend/   Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + Framer Motion
├── backend/    Spring Boot 3.5 / Java 17 (Maven), clean-architecture layering
├── docs/       Architecture decisions and the API contract
└── README.md
```

One repository, two independently deployable apps. There is **no shared code** between them
(one is TypeScript, the other Java). The **API contract is the integration boundary** — as long
as it is stable and the backend stays stateless, the future React Native Android app consumes the
exact same endpoints with no backend changes.

## Foundational decisions

### 1. Stateless, versioned REST API
- Everything lives under `/api/v1`. The version prefix lets us evolve without breaking shipped
  mobile clients (which users upgrade slowly).
- No server-side session state. Authentication (added in the Auth phase) will be JWT bearer
  tokens, which work identically for a browser and a native app.

### 2. One response envelope for every endpoint
Defined in `backend/.../common/api/ApiResponse.java` and mirrored in
`frontend/src/lib/api/types.ts`.

```jsonc
{ "success": true,  "data": { /* ... */ }, "error": null,                 "timestamp": "..." }
{ "success": false, "data": null,          "error": { "code": "...", "message": "...",
                                                        "details": [ /* field errors */ ] }, "timestamp": "..." }
```
Every client parses success and failure the same way. `error.code` is a stable enum name
(`ErrorCode`) clients can branch on without reading human text.

### 3. Centralised error handling
`GlobalExceptionHandler` (`@RestControllerAdvice`) is the only place that turns exceptions into
HTTP responses. Feature code throws typed exceptions (`AppException` subclasses); it never builds
error payloads itself.

### 4. Clean-architecture layering (backend)
```
controller  ->  service  ->  repository
   (DTOs)      (business)   (Spring Data JPA)
```
- Controllers speak DTOs only; JPA entities never leave the service layer.
- Validation via Bean Validation on request DTOs.
- Code is organised **by feature** (`feature/<name>/...`) with cross-cutting concerns in
  `common/`. The `health` feature is the reference example of the convention.

### 5. Timezone is a first-class concern (planned, enforced from the Habit phase)
Daily completion and streaks are meaningless without a day boundary. The user's IANA timezone
will live on their profile; habit completions are keyed by **local date**, not a UTC instant.

### 6. Derive analytics, don't denormalize
Raw `HabitCompletion` rows are the single source of truth. Streaks, completion %, best/worst day,
heatmap and sprint score are **computed on read**, not stored as counters that can drift. Caching
is added only if a real read becomes slow.

### 7. Configuration is environment-driven
No secrets or environment specifics in code. The backend reads `DATABASE_URL`, etc. from the
environment (`application.yml` placeholders, documented in `backend/.env.example`). The same build
artifact runs locally and against Supabase by swapping env vars.

## Toolchain notes
- **Java 17** today (Spring Boot 3.5 supports it). Bumping to 21 is a one-line change to
  `<java.version>` in `backend/pom.xml` once a JDK 21 is installed.
- **Maven wrapper** (`mvnw`) is committed, so no global Maven install is required.
- Tests run against in-memory **H2** (PostgreSQL mode), so `./mvnw test` is green without an
  external database.
- **Flyway** migrations are **deferred** until the schema stabilises / the real Supabase DB is
  wired in. Introducing migrations now — while the model changes every phase and tests run on
  H2 — adds friction for no current benefit. We use JPA `ddl-auto` (`update` in dev) meanwhile,
  and will switch to `validate` + Flyway before production.

## Corporate network / proxy notes

This machine sits behind a proxy that (a) intercepts TLS with a corporate root CA and
(b) returns **403 for all `.jar` downloads** from public Maven Central
(`repo.maven.apache.org`, `repo1.maven.org`). Two settings make Maven work without weakening
security:

1. **Mirror** — `~/.m2/settings.xml` redirects `central` to Google's faithful Maven Central
   mirror (`https://maven-central.storage-download.googleapis.com/maven2`), which the proxy
   allows. This is user-level config, not committed to the repo.
2. **TLS** — run Maven with `-Djavax.net.ssl.trustStoreType=Windows-ROOT` so Java trusts the
   same CAs Windows does (which includes the corporate proxy CA). No certificate export and no
   disabling of SSL verification required.

```bash
mvn -Djavax.net.ssl.trustStoreType=Windows-ROOT <goals>
```

On a network without these restrictions, neither setting is needed. The 9 MB Maven distribution
download is also throttled/reset by the proxy, so we use a Maven install already present in the
wrapper cache rather than the `mvnw` bootstrap.

## Build & phase status
- **Phase 0 — Foundation: complete.** Both apps scaffolded; versioned health endpoint + envelope
  + global exception handling on the backend; typed API client + theming foundation on the
  frontend.
- **Phase 1 — Auth & User: complete.** Email/password registration + login, stateless HS256
  access tokens, DB-stored rotating refresh tokens with reuse detection, BCrypt, stateless Spring
  Security with envelope-shaped 401/403, and `/users/me` (get + update profile incl. timezone).
  Frontend: auth context, in-memory access token + localStorage refresh token, API client with
  single-flight 401 refresh, login/register pages (react-hook-form + zod), and a guarded
  `/dashboard`.

  Auth contract:
  - `POST /api/v1/auth/register` · `POST /api/v1/auth/login` · `POST /api/v1/auth/refresh` ·
    `POST /api/v1/auth/logout` (public)
  - `GET /api/v1/users/me` · `PATCH /api/v1/users/me` (bearer token required)
- **Phase 2 — Quarterly Goals & 12-Week Cycle: complete.** `Cycle` (84-day window, objective,
  status) + `Goal` (free-form category, target/current value, week range) entities; day-of-cycle
  and week-of-cycle derived in the user's timezone; ownership-scoped CRUD (404, not 403, on
  cross-user access); manual progress tracking that will feed the Phase-4 dashboard. No `Week`
  table — weeks are numbers 1–12 derived from `startDate`. Frontend: cycles list, create form,
  and a detail page (Day X/84 progress, objective, goals with add / progress-update / delete).

  Cycle contract (all bearer-protected):
  - `POST /api/v1/cycles` · `GET /api/v1/cycles` · `GET /api/v1/cycles/current` ·
    `GET|PATCH|DELETE /api/v1/cycles/{id}`
  - `POST /api/v1/cycles/{id}/goals` · `PATCH|DELETE /api/v1/cycles/{id}/goals/{goalId}`
- **Phase 3 — Habit Tracker: complete.** `Habit` (user-scoped, ongoing) + `HabitCompletion`
  (one row per `(habit, localDate)`, unique) entities. Streaks, longest streak and completion %
  are **derived** from raw completion rows by a pure `HabitStats` calculator (6 unit tests),
  against today in the user's timezone. `UserTimeService` extracted and shared with the cycle
  feature. Two completion paths: server-side toggle of *today*, and set/clear a specific past
  date (backfill, future dates rejected). Frontend: habits list (today-toggle, 🔥 streak,
  completion %, inline create) and detail (stats + 14-day backfill grid + rename).

  Habit contract (all bearer-protected):
  - `POST/GET /api/v1/habits` · `GET|PATCH|DELETE /api/v1/habits/{id}`
  - `POST /api/v1/habits/{id}/today` (toggle today) ·
    `PUT|DELETE /api/v1/habits/{id}/completions/{date}` (backfill)
- **Phase 4 — Sprint Dashboard: complete.** `GET /api/v1/dashboard` aggregates the current cycle
  (reused from `CycleService`) with the user's habits and a computed **Sprint Score** =
  null-aware average of *goals progress* (avg goal %) and *habits consistency* (avg per-habit
  completion within the sprint window `max(cycleStart, habitStart)`→today). Pure `SprintScore`
  (4 unit tests). 404 when no active cycle. Frontend: the `/dashboard` route is now the hero —
  Sprint Score, Day X/84 progress, per-goal bars, and habit rows with a live today-toggle that
  re-fetches and recomputes the score; "create a cycle" empty state.

  Dashboard contract: `GET /api/v1/dashboard` (bearer-protected).
- **Phase 5 — Weekly Review: complete.** `WeeklyReview` keyed on `(cycleId, weekNumber)` (unique),
  storing the four prompts + denormalised `userId` for future cross-cycle pattern analytics.
  **Upsert** by week (`PUT`), no delete (answers are permanent); reviews are cascade-removed when
  their cycle is deleted. Frontend: `/cycles/[id]/reviews` — week selector (1–12, marks reviewed
  weeks + current week), prefilled 4-question form, save-per-week.

  Review contract (bearer-protected): `GET /api/v1/cycles/{id}/reviews` ·
  `GET|PUT /api/v1/cycles/{id}/reviews/{weekNumber}`
- **Phase 6 — Streak Analytics: complete.** `GET /api/v1/analytics` aggregates completions across
  all habits per day and derives overall current/longest activity streaks (all-time), total/active
  days, best & worst day-of-week, and a GitHub-style heatmap (`{date, count}`, sparse, over the
  trailing 365 days). Streak math extracted into a shared `Streaks` util used by both
  `HabitStats` and the new pure `AnalyticsCalculator` (4 unit tests). Frontend: `/analytics` —
  stat cards, a contribution heatmap, and a weekday bar chart.

  Analytics contract: `GET /api/v1/analytics` (bearer-protected).
- **Phase 7 — Polish: complete.** Framer Motion entrance/stagger animations (`FadeIn`/`Stagger`
  primitives) on the dashboard, auth, analytics, and the cycles/habits lists; loading
  **skeletons** replacing plain text on the data pages; active-section nav highlighting; a styled
  404; metadata polish (title template, Apple web-app meta, light/dark `theme-color`); and a
  **web manifest + icon** making the app installable ("Add to Home Screen"). Offline service
  worker is intentionally deferred.

- **Phase 8 — Email OTP (verification + password reset): complete.** Registration now creates an
  unverified account and emails a 6-digit OTP (no tokens until verified); `verify-email` confirms
  and logs in; login rejects unverified accounts with `EMAIL_NOT_VERIFIED`. Password reset via OTP
  (`forgot-password` → `reset-password`, which revokes all sessions). Rules: 5-min expiry, 120s
  resend cooldown, max 5 attempts, codes stored hashed. Pluggable `EmailSender` —
  `log` (dev, prints to console) or `resend` (HTTP, works on Render's SMTP-blocked free tier),
  chosen by `app.email.provider`. Existing accounts are backfilled as verified (DB column default
  `true`) so only new sign-ups must verify. Pure `Otps` helpers unit-tested.

  Auth additions: `POST /api/v1/auth/{verify-email,resend-otp,forgot-password,reset-password}`;
  `register` now returns `{ email, verificationRequired }`. Frontend: `/verify-email`,
  `/forgot-password`, `/reset-password` with resend countdowns.

**All six core features + polish + email OTP are implemented.** Remaining future work: Flyway
migrations + `validate` before production, an offline service worker, recurring-pattern analytics
over stored weekly reviews, and a scheduled cleanup of expired OTP rows.
