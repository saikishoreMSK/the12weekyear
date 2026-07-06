# Android App Plan — The 12 Week Year

This document is the source of truth for adding a **native Android app** *alongside* the existing web
app. Both clients are kept; they share one backend. Update it whenever a decision changes.

> **Intent:** the web app stays exactly as it is. We add a second front end — a React Native
> (Expo) Android app — that consumes the *same* stateless, versioned, JWT-authenticated REST API
> (`/api/v1`). No backend rewrite; only small, additive backend changes.

## Locked decisions

| Area | Decision | Why |
|------|----------|-----|
| Scope | Web **and** Android (two clients, one backend) | The API was built stateless/JWT from day one precisely for this |
| Code layout | **Monorepo + shared core** | `frontend/` → `apps/web`, add `apps/mobile`, extract `packages/core`; both clients stay in sync |
| Framework | **Expo + EAS** (Expo Router, NativeWind) | Managed workflow + dev builds cover offline, notifications, widgets; easy Play Store path |
| Data fetching | **TanStack Query** (same as web) | Reused from web with minimal change |
| Token storage | **expo-secure-store** (Android Keystore) | Security upgrade over web's localStorage |
| Offline | **expo-sqlite + outbox** | Local source of truth + pending-write queue + client-side derivation |
| Sync | **LWW + idempotent** | Completions idempotent per `(habit, date)`; goals/reviews last-write-wins |
| Notifications | **On-device scheduled** (expo-notifications) | Zero backend, offline-safe, timezone-correct; FCM only if push is later needed |
| Tooling | **npm workspaces** (Turborepo added when needed) | npm is already proven against the corporate proxy and avoids pnpm's Metro/RN symlink friction; Turborepo deferred until cross-package orchestration is needed |
| Platform | **Android first**, iOS-compatible | Keep code iOS-ready so iOS is mostly a build target later |
| Min SDK | **API 26 (Android 8)** | Interactive widgets shine on 12+, degrade gracefully below |

## Target repository topology

```
The12WeekYear/
├── apps/
│   ├── web/       ← current frontend/, moved (behavior unchanged)
│   └── mobile/    ← new Expo app
├── packages/
│   └── core/      ← SHARED: API types, API client, TanStack Query hooks, zod schemas,
│                     and calculators ported from backend (see below)
├── backend/       ← unchanged (small additive changes over M4/M5)
└── docs/
```

**`packages/core`** is the anti-drift layer. Both apps import: the `ApiResponse`/`ErrorCode` types,
the typed API client + refresh-token flow, the TanStack Query hooks (`useDashboard`, `useHabits`, …),
and the zod form schemas. New for mobile: **client-side calculators** ported from the backend's pure
utils — `QuarterMath`, `Streaks`, `SprintScore`, `AnalyticsCalculator` — so the app can compute
scores/streaks/day-of-quarter offline without a server round-trip.

## What differs from the web app

1. **Offline-first**, not online-first (local DB + outbox + sync).
2. **Server-computed values move to the client** — streaks, quarter score, day-of-quarter, analytics
   are computed on the server today; ported to `packages/core` for offline.
3. **Mutations are queued** in an outbox and synced when online (simple LWW; completions idempotent).
4. **No SSR, no DOM, no CORS**; native components + NativeWind instead of Tailwind/shadcn.
5. **Navigation is a bottom tab bar** (see below), not a top header nav.
6. Framer Motion → **Reanimated/Moti**; localStorage → **SecureStore**.

**Offline boundary:** first-time sign-up, email OTP, and login on a new device require connectivity.
After the first successful login + sync, the app is **fully offline-capable** and syncs when the
network returns.

## Navigation (mobile) — bottom tab bar

Web keeps its top nav. Mobile uses a native bottom tab bar (safe-area aware, haptic on switch,
`lucide-react-native` icons). **5 tabs:**

```
 🏠          📅         🗓️        ✅         👤
Dashboard  Quarter    Week     Habits   Profile
```

Quarter and Week are **not** grouped. **Analytics is not a top-level tab** — it lives inside Profile.

### Profile tab (mobile-only) holds
- **Account** — name, email, edit profile, timezone.
- **Analytics** — link into the streaks / contribution-heatmap / weekday screen.
- **Sync status** — last-synced time + online / offline / pending-changes indicator. (Sync stays
  automatic when online; this only *shows* state.)
- **Share your progress** — share-as-image card (quarter score / streak).
- **Notifications** — reminder toggles + times (M5 settings live here).
- **Security** — biometric app-lock toggle.
- **Go Premium** — placeholder entry point, disabled / "coming soon" for now, wired up later.
- **About** — app version, backup/export data, sign out.

## Android-specific features

- **Offline** (M4) — expo-sqlite local store, TanStack Query persistence, outbox for pending writes,
  client-side derivation, sync-status indicator.
- **Notifications** (M5) — on-device scheduled: 2–3 daily habit reminders (configurable times),
  Sunday-evening weekly-review nudge, end-of-quarter "plan next quarter" nudge; deep-link on tap.
- **Interactive widgets** (M6) — Android home-screen widgets (today's habits with tap-to-complete,
  streak/quarter-score, this-week's-goal toggle) via `react-native-android-widget` / Glance, wired to
  the local store + outbox.
- **Extras** (M7) — biometric app lock, haptics on habit toggle, app shortcuts, share-progress card,
  local backup/export & import, Sentry crash reporting.

## Backend changes (small, additive — no breaking changes)

- Add `updatedAt` timestamps to mutable entities (goals, reviews, completions) for LWW sync — done in
  M4.
- Optional `GET /api/v1/sync?since=` delta endpoint (efficiency; can start with existing endpoints).
- FCM device-token endpoint **only if** server push is later added (not in current scope).

## Development & testing environment

The dev laptop is a locked-down corporate machine (no Android Studio / emulator / Android SDK). This
is fine — with Expo, the laptop only needs **Node** (already present); everything native is either
handled by a free phone app or **compiled in Expo's cloud (EAS)**, never locally.

Confirmed available: a **personal Android phone** for testing + a **free Expo account** for EAS.

Three testing tiers:
- **Tier 1 — Expo Go** (free Play Store app): `expo start` + QR scan → live hot reload on the phone.
  Covers all UI, navigation, auth, and bundled native modules (SQLite, SecureStore, biometrics).
  Handles ~M0–M4. (Optional laptop-browser preview via react-native-web for layout-only iteration.)
- **Tier 2 — EAS development build** (cloud-compiled APK, installed once): needed for native code
  Expo Go lacks — **notifications (M5)** and **widgets (M6)**. Live JS reload still works on top.
- **Tier 3 — EAS production build** (cloud AAB/APK) → Play Store internal testing → release (M8).

Network note: Expo Go connects phone↔laptop over Wi-Fi; corporate Wi-Fi may isolate devices, so use
`expo start --tunnel` or the laptop on the phone's hotspot. Proxy workarounds (as used for Maven) may
apply to pnpm/Expo registry or the EAS tunnel.

## Phases

Same rhythm as the web build: explain each phase before coding, finish and verify before the next,
"next" advances.

- **M0 — Foundation & shared core.** Monorepo (pnpm + Turborepo); move `frontend/` → `apps/web`
  (behavior unchanged); extract `packages/core`; scaffold `apps/mobile` (Expo + Expo Router +
  NativeWind + EAS); theming; SecureStore token storage; networking with the envelope + refresh flow.
- **M1 — Auth.** Register → OTP verify → login → forgot/reset; session persistence; secure token
  storage.
- **M2 — Read screens (online-first) + navigation.** Bottom tab bar (Dashboard, Quarter, Week,
  Habits, Profile); port the read screens with TanStack Query; Profile shell incl. Analytics screen.
- **M3 — Interactions + optimistic UI.** Habit toggles, goal done, add habit, 7-day picker (reuse
  optimistic/debounce pattern).
- **M4 — Offline-first.** SQLite store, query persistence, outbox + sync, port calculators to
  `core`, conflict handling, sync indicator; backend `updatedAt`.
- **M5 — Notifications.** On-device scheduled reminders (habits / review / quarter-end); permission
  flow; settings in Profile; deep-link on tap.
- **M6 — Widgets.** Interactive Android home-screen widgets wired to the local store.
- **M7 — Polish & Android extras.** Biometrics, haptics, app shortcuts, share card, splash/icon,
  animations, offline empty states.
- **M8 — Release.** EAS build, Play Store internal testing, Sentry, versioning → production.

## Status
**M0 complete** (pending on-device confirmation). Verified: web build green, `@twy/core` typecheck
green, mobile typecheck green, **Android bundle exports green** (Metro resolves `@twy/core` across
the monorepo).

- Monorepo established with **npm workspaces**; `frontend/` → `apps/web` (`@twy/web`); root
  `package.json`, `.gitignore`, single root lockfile.
- Render web service repointed to build from the monorepo root (`render.yaml`).
- **`@twy/core`**: API envelope types, platform-agnostic API client, and the **`TokenStorage` seam**
  (base URL + storage injected via `configureApiClient`). Web injects localStorage via a thin shim at
  `@/lib/api/client` (existing imports unchanged).
- **`apps/mobile`** (`@twy/mobile`): Expo SDK 57 (Expo Router, RN 0.86, React 19), monorepo
  `metro.config.js`, app identity in `app.json` (name/slug/scheme/`com.twelveweekyear.app`),
  `EXPO_PUBLIC_API_BASE_URL` env (defaults to the Render backend so a phone can reach it), an M0
  in-memory `TokenStorage` stub (SecureStore comes in M1), and a **health-ping home screen** that
  calls `/api/v1/health` through `@twy/core`. Demo template screens trimmed.

On-device check: run `npm run start:mobile` (add `-- --tunnel` if corporate Wi-Fi isolates devices)
and open in Expo Go — expect "API reachable ✓".

**Monorepo hoisting notes (learned the hard way):**
- React is unified to **19.2.4** across the workspace. Next 16 requires `^19.2.4`; `react-native`
  0.86's peer is `^19.2.3`, which accepts 19.2.4 — so one version satisfies both. (`expo install
  --check` softly suggests 19.2.3; ignore — RN's peer range governs.)
- `@expo/cli` is hoisted to the repo root but `expo start` `require()`s `expo-router` (and subpaths
  like `expo-router/internal/routing`) from there. Transitive conflicts (e.g. web pulls
  `react-is@16` to root while `expo-router` needs `^19.1`) kept nesting `expo-router` under
  `apps/mobile`, so the CLI couldn't find it. Fix: **declare `expo-router` in the root
  `package.json`** so it resolves at root for the CLI; Metro still bundles it fine. Also set
  `experiments.typedRoutes: false` in `app.json` (its type generator hit the same resolution path).

**M1 complete** (pending on-device confirmation). Verified: web build green, core + mobile typecheck
green, Android `expo export` green (1400 modules).

- **`expo-secure-store`** now backs mobile token storage (Android Keystore); the M0 in-memory stub
  is gone. Access token in memory, refresh token encrypted at rest, async reads on cold start.
- **Auth migrated into `@twy/core`**: `auth/{types,api,schemas}` (+ `zod` dep). Web re-exports them
  from its `features/auth/{types,api,schemas}` shims — no web import sites changed, no drift. This is
  the first feature migration.
- **Mobile auth**: `AuthProvider` (session bootstrap from secure storage + single-flight refresh via
  the shared client), `(auth)` route group with **login / register / verify-email / forgot-password /
  reset-password** (react-hook-form + zod, 120s resend cooldown), and route guards — `(app)` requires
  a session, `(auth)` bounces signed-in users. StyleSheet UI primitives in `components/ui.tsx` +
  `theme.ts` (NativeWind still deferred to M2). Deleted the Expo template's theme/demo cruft.
- The M0 health screen is replaced by an authenticated placeholder (`(app)/index.tsx`).

On-device check: register a test account → OTP email → verify → land signed in; login/logout;
forgot/reset. Styling is StyleSheet (light/dark aware); NativeWind + real Dashboard land in **M2**.

Next: **M2 — read screens + bottom tab bar** (Dashboard / Quarter / Week / Habits / Profile),
online-first, migrating quarter/habit/analytics types+api+queries into `@twy/core`.
