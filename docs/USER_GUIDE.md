# The 12 Week Year — User Guide

A walkthrough of the whole app, from sign-up to daily use, with a running example.

> **The idea:** stop planning in vague 12-month chunks where the deadline feels far away. Instead
> you treat each **calendar quarter** (Q1 Jan–Mar, Q2 Apr–Jun, Q3 Jul–Sep, Q4 Oct–Dec) like its own
> "year." A quarter runs ~13 weeks; you set **one goal per week**, drive them with daily **habits**,
> keep score with a **quarter score**, and reflect every week. Over time, **analytics** show your
> patterns.

Throughout, we'll follow one example user:

> **Example — "Crack a product-based company this quarter."**

---

## The mental model (how the pieces fit)

You navigate the app as one **zoom axis**, from the whole year down to a single day:

```
Dashboard  ─────  the YEAR: four quarters in a 2×2 grid (Q1…Q4), each with its score
   │
Quarter    ─────  one quarter (Q3 · Jul–Sep) — its weekly goals, habits & report
   │
Week       ─────  one week (Week 4 of 13) — this week's single goal + habit grid
   │
Habits     ─────  one day — tick today's habits, build streaks
   │
Analytics  ─────  patterns across all your habit history (streaks, heatmap)
```

Inside a quarter:

```
Q3 · Jul–Sep 2026            (13 weeks, state: active, score 78%)
  │
  ├── Weekly goals ──  ONE goal per week
  │     • Week 1  Finish arrays & hashing         ✓ done
  │     • Week 2  Two-pointer + sliding window     ✓ done
  │     • Week 3  Trees & recursion                ← this week
  │     • Week 4  Graphs (BFS/DFS)                 upcoming
  │       …up to Week 13
  │
  ├── Habits ────────  daily actions that drive the goals (streaks carry across quarters)
  │     • 2 DSA questions      🔥 9-day streak
  │     • 1h System Design     🔥 4-day streak
  │     • Gym                  🔥 12-day streak
  │
  └── Weekly review ──  every week: what went well / wasted time / win / blocker
```

**Weekly goals vs Habits** — the distinction that matters:
- A **weekly goal** is the one outcome for *that week* ("finish trees & recursion"). You tick it done.
- A **habit** is a daily *action* you repeat ("do 2 DSA questions today"). You tick it each day and
  build a streak. Habits are **not** reset between quarters, so streaks keep growing.

---

## 1. Sign up & verify

1. Open the app → landing page → **Get started**.
2. On **/register**, enter **Name**, **Email**, **Password** (min 8 chars). Your **timezone is detected
   automatically** from your browser — this matters because "today," streaks, and "Day X of the
   quarter" are all calculated in *your* local day, not the server's.
3. We email you a **6-digit OTP**. Enter it on **/verify-email** to confirm your account.
   - The code expires in **5 minutes**; you can **resend** after a 120-second cooldown; you get **5
     attempts**.
   - Registration stays blocked until you verify — no account is usable without a confirmed email.
4. Once verified you're signed in and land on the **Dashboard**.

**Returning later?** **/login** with just email + password (already-verified accounts skip OTP). You
stay signed in across reloads — a refresh token is kept in the browser and your session silently
renews in the background.

**Forgot your password?** **/forgot-password** emails an OTP; **/reset-password** takes the code + a
new password and signs you out everywhere for safety.

> Behind the scenes: you get a short-lived access token (15 min) that's auto-refreshed, so you're
> never unexpectedly logged out mid-session. **Sign out** clears it.

---

## 2. The Dashboard — your year at a glance

The **Dashboard** shows the whole year as a **2×2 grid of the four quarters**:

```
                         2026            ‹  ›

  ┌───────────────────────────┐  ┌───────────────────────────┐
  │ Q1 · Jan–Mar   completed  │  │ Q2 · Apr–Jun   completed  │
  │ 82%   ▓▓▓▓▓▓▓▓░            │  │ 74%   ▓▓▓▓▓▓▓░░            │
  └───────────────────────────┘  └───────────────────────────┘
  ┌───────────────────────────┐  ┌───────────────────────────┐
  │ Q3 · Jul–Sep   active     │  │ Q4 · Oct–Dec              │
  │ 78%   ▓▓▓▓▓▓▓▓░            │  │        Not planned yet    │
  │ Day 23/92                 │  │        [ Plan Q4 ]        │
  └───────────────────────────┘  └───────────────────────────┘
```

- Each tile shows the quarter's **state** — *upcoming*, *active*, or *completed* — and, once planned,
  its **score** and progress. The active quarter also shows **Day X / total days**.
- A quarter you haven't set up shows a **Plan Qn** button.
- Use **‹ ›** to move between years. Everything is keyed to the real calendar, so Q3 is always
  Jul–Sep — you don't pick start dates.
- A **Quote of the day** sits at the top — a rotating bit of motivation you can dismiss.

Tap any planned quarter tile to open it.

---

## 3. Plan a quarter & set weekly goals

From a **Plan Qn** button (or **/quarters/new**) you create the quarter with a short **title**, e.g.
`Q3 — Crack a product company`. Because dates come from the calendar, there's nothing else to
configure — the quarter immediately knows its weeks (1–13) and which week is "current."

Then you set **one goal per week**. Open the quarter (or the **Week** view) and add a goal:

| Week | Goal (title) |
|------|--------------|
| 1 | Finish arrays & hashing |
| 2 | Two-pointer + sliding window |
| 3 | Trees & recursion |
| 4 | Graphs (BFS/DFS) |
| … | … |
| 13 | Mock interviews + apply |

- A goal is just a **title + its week** — no numeric targets to babysit. When you finish that week's
  goal, you tick it **done**.
- Each goal shows a **status** derived from the calendar: **done**, **this week**, **upcoming**, or
  **missed** (a past week you never ticked).
- **Pacing** tells you whether you're **ahead / on track / behind** based on how many weeks have
  elapsed vs. how many goals you've completed.

> Why one goal per week? It forces focus. Instead of a sprawling target list, you commit to a single
> concrete outcome for each of the 13 weeks.

---

## 4. Create daily habits

Weekly goals tell you *what to finish this week*; habits are the *daily reps* that get you there. Go
to **Habits → Add habit**:

- `2 DSA questions`
- `1 hour System Design`
- `30 min on project`
- `Gym`

A habit is **done-or-not per day** (any count lives in the name — you just tick it once done).

### The daily loop
The **Habits** page opens on **today**. A **7-day strip** lets you page across the week and pick a
day; tapping a habit toggles it for the **selected** day (you can't tick future days). Each habit shows:
- 🔥 **Current streak** — consecutive days completed. It stays "alive" through today until midnight,
  so missing the morning doesn't break it.
- **Completion %** — how consistent you've been since the habit started.
- **Longest streak** — your record.

**Missed a day?** Just page back on the 7-day strip and tick it. (Toggles are instant — the UI
updates immediately and saves in the background, batching rapid taps so it's light on the network
even on a flaky connection.)

**Done with a habit?** Open it (**/habits/[id]**) and **archive** it — it moves to a collapsed
*Archived* section, keeping all its history, and you can **resume** it later.

> Example: you do your 2 DSA questions every day for 9 days → 🔥 **9-day streak**, **100%**. Skip
> one → the streak resets next day, but your **longest streak** still remembers the 9.

---

## 5. The Week view — this week, in focus

The **Week** view zooms into a single week of the quarter:

```
Week 3  · Jul 15 – Jul 21 · Q3 2026        (this week)
[1][2][3][4][5][6][7][8][9][10][11][12][13]   ← pick any week; current is ringed

Week 3 goal
  ○ Trees & recursion                      [ mark done ]

Habit completion (Mon–Sun)
              M  T  W  T  F  S  S
  2 DSA       ✓  ✓  ✓  ○  ·  ·  ·
  System Des  ✓  ○  ✓  ○  ·  ·  ·
  Gym         ✓  ✓  ○  ✓  ·  ·  ·

  → Write this week's review
```

- The **week selector** (1–13) lets you jump to any week; the current week is highlighted.
- It shows that week's **single goal** — add one if the week is empty, or tick it done.
- A **habit grid** shows completion for each of the week's seven dates, so you can fill the week at a
  glance.
- A link takes you straight to **this week's review**.

---

## 6. The quarter score

Each planned quarter has a **score** (0–100%) shown on its dashboard tile and quarter page. It blends
two things and averages them:

1. **Weekly goals** — the share of your weekly goals marked **done** (relative to weeks elapsed).
2. **Habit consistency** — for each habit, the % of days completed within the quarter window,
   averaged together.

If you track only goals (no habits) or only habits (no goals), the score uses whichever you have —
it won't drag you to zero for the part you're not using. The classic 12-Week-Year target is **~85%**.

At the end of a quarter, its **report** (`/quarters/[id]/report`) summarizes how you did — goals
completed, habit consistency, and final score.

---

## 7. Weekly review (every week)

Reflection is what turns activity into improvement. From the Week view or the quarter, open
**Weekly reviews** (**/quarters/[id]/reviews**):

1. Pick the week (defaults to the current week; reviewed weeks are marked; range is 1–13).
2. Answer four prompts:
   - **What went well?** — *"Hit DSA every day; finally understood consistent hashing."*
   - **What wasted time?** — *"Rabbit-holed on a UI library I didn't need."*
   - **Biggest win?** — *"Solved a hard graph problem unaided."*
   - **Biggest blocker?** — *"System design felt unstructured — need a syllabus."*
3. **Save.**

Reviews are stored **permanently** (you can edit a week, but they're never deleted) — so across a
quarter you build an honest log you can scan for recurring patterns.

---

## 8. Analytics — your patterns over time

The **Analytics** page looks across *all* your habit history (not just one quarter):

- **Current streak / Longest streak** — overall daily activity (any habit done = an active day).
- **Best day / Worst day** — the weekday you're most and least consistent.
  *Example:* Best = **Tuesday**, Worst = **Sunday** → maybe protect Sunday or lower its load.
- **Contribution heatmap** — a GitHub-style grid of the last year, **grouped by month** with month
  labels; each square is a day, shaded darker the more habits you completed. Great for *seeing* your
  consistency at a glance.
- **By day of week** — a small bar chart of completions per weekday.

---

## A week in the life (putting it together)

| When | What you do |
|------|-------------|
| **Each morning** | Open the Dashboard; glance at the active quarter's score and day count. |
| **During the day** | Do your habits; tap each one done. Streaks tick up. |
| **This week** | Open **Week**; when you finish the week's goal, mark it done. |
| **Sunday** | Write the weekly review; roll into next week's goal. |
| **Anytime** | Check Analytics to spot trends; adjust which day carries which habit. |
| **End of quarter** | Open the quarter **report**; then plan the next quarter — habit streaks carry over. |

---

## Feature → screen → API quick reference

For developers, every screen maps to a versioned REST endpoint (all bearer-authenticated except
auth). The same contract powers a future React Native Android app.

| Feature | Screen | API |
|---------|--------|-----|
| Register / verify / login | `/register`, `/verify-email`, `/login` | `POST /api/v1/auth/register`, `/verify-email`, `/resend-otp`, `/login`, `/refresh`, `/logout` |
| Password reset | `/forgot-password`, `/reset-password` | `POST /api/v1/auth/forgot-password`, `/reset-password` |
| Profile (name, timezone) | header / account | `GET`/`PATCH /api/v1/users/me` |
| Year dashboard | `/dashboard` | `GET /api/v1/dashboard?year=` |
| Quarters & weekly goals | `/quarter`, `/quarters/new`, `/quarters/[id]` | `POST/GET/PATCH/DELETE /api/v1/quarters`, `GET /api/v1/quarters/current`, `…/quarters/{id}/goals…` |
| Quarter report | `/quarters/[id]/report` | `GET /api/v1/quarters/{id}/report` |
| Week view | `/week` | (reuses `/quarters/current` + `/habits`) |
| Habits & daily toggle | `/habits`, `/habits/[id]` | `…/habits`, `POST …/habits/{id}/today`, `PUT/DELETE …/completions/{date}` |
| Weekly review | `/quarters/[id]/reviews` | `GET`/`PUT /api/v1/quarters/{id}/reviews/{week}` |
| Streak analytics | `/analytics` | `GET /api/v1/analytics` |

Full architecture and design decisions: see [ARCHITECTURE.md](ARCHITECTURE.md).
