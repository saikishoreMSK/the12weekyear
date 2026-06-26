# The 12 Week Year — User Guide

A walkthrough of the whole app, from sign-up to daily use, with a running example.

> **The idea:** stop planning in 12-month chunks where the deadline feels far away. Instead you run
> a **12-week cycle (84 days)** treated like a "year." Each cycle has one big **objective**, broken
> into measurable **goals**, executed through daily **habits**, kept honest by a **sprint score**,
> and reflected on every week. After a few cycles, **analytics** show your patterns.

Throughout, we'll follow one example user:

> **Example — "Crack a product-based company in 12 weeks."**

---

## The mental model (how the pieces fit)

```
Cycle  ──────────────  "Q3 — Crack a product company"   (84 days, one objective)
  │
  ├── Goals ─────────  measurable targets for the cycle
  │     • DSA            10 / 28 problems
  │     • System Design   4 / 10 topics
  │     • Project        30 / 100 %
  │     • Applications    8 / 20 sent
  │
  ├── Habits ────────   daily actions that drive the goals (build streaks)
  │     • 2 DSA questions      🔥 9-day streak
  │     • 1h System Design     🔥 4-day streak
  │     • Gym                  🔥 12-day streak
  │
  ├── Weekly Review ──  every week: what went well / wasted time / win / blocker
  │
  └── Dashboard ─────   Day 23/84 · Sprint Score 78%  (goals × habits, live)

Analytics ───────────   streaks, best/worst weekday, contribution heatmap (across cycles)
```

**Goals vs Habits** — the distinction that matters:
- A **goal** is an outcome you track to a target ("solve 28 DSA problems"). You nudge its progress.
- A **habit** is the daily *action* that gets you there ("do 2 DSA questions today"). You tick it off
  each day and build a streak. Habits are **not** reset between cycles, so streaks keep growing.

---

## 1. Sign up & sign in

1. Open the app → landing page → **Get started**.
2. On **/register**, enter **Name**, **Email**, **Password** (min 8 chars). Your **timezone is detected
   automatically** from your browser — this matters because "today," streaks, and "Day X/84" are all
   calculated in *your* local day, not the server's.
3. You're signed in immediately and land on the **Dashboard**.

Returning later? **/login** with email + password. You stay signed in across reloads (a refresh
token is kept in the browser; your session silently renews in the background).

> Behind the scenes: you get a short-lived access token (15 min) that's auto-refreshed, so you're
> never unexpectedly logged out mid-session. **Sign out** clears it everywhere.

---

## 2. Create your 12-week cycle

The cycle is the container for everything.

1. Go to **Cycles → New cycle**.
2. Fill in:
   - **Title:** `Q3 2026 — Crack a product company`
   - **Objective:** *"Land an offer at a product-based company by clearing DSA + system design
     rounds and applying consistently."*
   - **Start date:** today (or a Monday you want to begin).
3. **Create cycle** → you're taken to the cycle page showing **Day 1 / 84**, **Week 1 / 12**, and a
   progress bar that fills as the 84 days pass.

You can run multiple cycles over time (Q3, Q4…). The **active** one is what the dashboard shows.
When a cycle ends, open it and hit **Mark complete**.

---

## 3. Break the objective into goals

On the cycle page, **Add goal** for each measurable target. For our example:

| Category | Title | Target | Unit | Weeks |
|----------|-------|--------|------|-------|
| DSA | Solve 28 DSA problems | 28 | problems | 1–12 |
| System Design | Cover 10 SD topics | 10 | topics | 1–12 |
| Project | Ship portfolio project | 100 | % | 1–8 |
| Applications | Send 20 applications | 20 | applications | 9–12 |

Notes from the example:
- **Category is free text** — use "DSA"/"System Design" for a job hunt, or "Fitness"/"Reading" for
  anything else. The app isn't locked to one use case.
- **Week range** lets a goal apply to only part of the cycle. Here, *Project* is front-loaded
  (weeks 1–8) and *Applications* is back-loaded (weeks 9–12) — finish building before you apply.
- A **percentage goal** (Project) is just target `100`, unit `%`.

### Tracking progress
Each goal shows `current / target` and a bar. As you make progress, set the new value:
- Solved 10 DSA problems so far → set **DSA** current to `10` → bar shows **36%** (10/28).
- Made the project halfway → set **Project** to `50` → **50%**.

You update these whenever you want (e.g., at your weekly review).

---

## 4. Create daily habits

Goals tell you *what*; habits are the *daily reps*. Go to **Habits → Add habit**:

- `2 DSA questions`
- `1 hour System Design`
- `30 min on project`
- `Gym`

A habit is **done-or-not per day** (the "2" lives in the name — you just tick it once you've done it).

### The daily loop
On the **Habits** page (or right on the **Dashboard**), tap a habit's circle to mark it **done today**.
Each habit shows:
- 🔥 **Current streak** — consecutive days completed. It stays "alive" through today until midnight,
  so missing the morning doesn't break it — you have until end of day.
- **Completion %** — how consistent you've been since the habit started.
- **Longest streak** — your record.

**Missed a day?** Open the habit (**/habits/[id]**) and use the **last-14-days grid** to back-fill a
day you actually did but forgot to tick. (You can't tick future days.)

> Example: you do your 2 DSA questions every day for 9 days → 🔥 **9-day streak**, **100%**. Skip
> one → streak resets next day, but your **longest streak** still remembers the 9.

---

## 5. The Dashboard & Sprint Score

The **Dashboard** is your daily home screen for the active cycle:

```
Q3 2026 — Crack a product company
Day 23 / 84 · Week 4 / 12        ▓▓▓▓░░░░░░░░  27%

        Sprint Score                 Goals  41%
            78%                       Habits 86%
        ▓▓▓▓▓▓▓▓░░

Goals
  DSA: Solve 28 DSA problems          10 / 28 problems   ▓▓▓░░░░░
  System Design: Cover 10 topics       4 / 10 topics     ▓▓▓░░░░
  ...

Today's habits
  ✓ 2 DSA questions        🔥 9   95%
  ○ 1 hour System Design   🔥 4   70%
  ✓ Gym                    🔥 12  90%
```

Tapping a habit here marks it done and the **Sprint Score updates instantly**.

### How the Sprint Score is calculated
It blends two things, each 0–100%, then averages them:

1. **Goals progress** — the average completion % across your goals.
   *Example:* DSA 36% + SD 40% + Project 50% + Apps 40% → average **41%**.
2. **Habits consistency** — for each habit, the % of days you completed it **since this sprint
   started**, averaged together.
   *Example:* 95% + 70% + 90% → **85%** (shown ~86%).

> **Sprint Score = (41% + 85%) / 2 ≈ 78%.**

If you only track goals (no habits) or only habits (no goals), the score uses whichever you have —
it won't drag you to zero for the part you're not using. The classic 12-Week-Year target is **~85%**.

---

## 6. Weekly review (every Sunday)

Reflection is what turns activity into improvement. On the cycle page → **Weekly reviews**:

1. Pick the week (it defaults to the current week; reviewed weeks show a green dot).
2. Answer four prompts:
   - **What went well?** — *"Hit DSA every day; finally understood consistent hashing."*
   - **What wasted time?** — *"Rabbit-holed on a UI library I didn't need."*
   - **Biggest win?** — *"Solved a hard graph problem unaided."*
   - **Biggest blocker?** — *"System design felt unstructured — need a syllabus."*
3. **Save week 4.**

Reviews are stored **permanently** (you can edit a week, but they're never deleted) — so across a
cycle you build an honest log you can scan for recurring patterns.

---

## 7. Analytics — your patterns over time

The **Analytics** page looks across *all* your habit history (not just one cycle):

- **Current streak / Longest streak** — overall daily activity (any habit done = an active day).
- **Best day / Worst day** — the weekday you're most and least consistent.
  *Example:* Best = **Tuesday**, Worst = **Sunday** → maybe protect Sunday or lower its load.
- **Contribution heatmap** — a GitHub-style grid of the last year; each square is a day, shaded
  darker the more habits you completed that day. Great for *seeing* your consistency at a glance.
- **By day of week** — a small bar chart of completions per weekday.

---

## A week in the life (putting it together)

| When | What you do |
|------|-------------|
| **Each morning** | Open the Dashboard, glance at Day X/84 and your Sprint Score. |
| **During the day** | Do your habits; tap each one done. Streaks tick up. |
| **When you hit a milestone** | Bump a goal's progress (e.g., DSA 10 → 12). |
| **Sunday** | Write the weekly review; update goal numbers for the week. |
| **Anytime** | Check Analytics to spot trends; adjust which day carries which habit. |
| **Day 84** | Mark the cycle complete; start the next one — your habit streaks carry over. |

---

## Feature → screen → API quick reference

For developers, every screen maps to a versioned REST endpoint (all bearer-authenticated except
auth). The same contract powers a future mobile app.

| Feature | Screen | API |
|---------|--------|-----|
| Register / Login | `/register`, `/login` | `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout` |
| Profile (name, timezone) | header / account | `GET`/`PATCH /api/v1/users/me` |
| Cycles & goals | `/cycles`, `/cycles/[id]` | `…/cycles`, `…/cycles/{id}/goals…` |
| Habits & daily toggle | `/habits`, `/habits/[id]` | `…/habits`, `POST …/habits/{id}/today`, `PUT/DELETE …/completions/{date}` |
| Sprint dashboard | `/dashboard` | `GET /api/v1/dashboard` |
| Weekly review | `/cycles/[id]/reviews` | `GET`/`PUT /api/v1/cycles/{id}/reviews/{week}` |
| Streak analytics | `/analytics` | `GET /api/v1/analytics` |

Full architecture and design decisions: see [ARCHITECTURE.md](ARCHITECTURE.md).
