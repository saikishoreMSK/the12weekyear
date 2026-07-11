/**
 * Guest (local-first) backend. When the app has no account, @twy/core routes every data call here
 * instead of the network (see the LocalBackend seam). Raw entities live in AsyncStorage; all derived
 * views (quarter score, pacing, per-habit stats, analytics, report) are computed on-device with the
 * same ported calculators the server uses — so a guest's numbers match, ready to sync later.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  average,
  combineScore,
  computeAnalytics,
  computeGoalStatus,
  configureLocalBackend,
  currentStreak,
  habitStats,
  longestStreak,
  quarterBounds,
  quarterLabel,
  quarterProgress,
  quarterTotalWeeks,
  rateInWindow,
  toIsoDate,
  type Analytics,
  type CreateGoalInput,
  type CreateHabitInput,
  type CreateQuarterInput,
  type Goal,
  type GuestExport,
  type Habit,
  type LocalBackend,
  type Quarter,
  type QuarterHabit,
  type QuarterReport,
  type QuarterTile,
  type UpdateGoalInput,
  type UpdateHabitInput,
  type UpdateQuarterInput,
  type WeeklyReview,
  type WeeklyReviewInput,
  type YearDashboard,
} from "@twy/core";

const KEY = "twy.localDb";

interface RawQuarter {
  id: string;
  year: number;
  quarterNumber: number;
  title: string | null;
  objective: string | null;
}
interface RawGoal {
  id: string;
  quarterId: string;
  title: string;
  week: number;
  done: boolean;
}
interface RawHabit {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  startDate: string;
  active: boolean;
  completionDates: string[];
  createdAt: string;
}
interface RawReview {
  id: string;
  quarterId: string;
  weekNumber: number;
  wentWell: string | null;
  wastedTime: string | null;
  biggestWin: string | null;
  biggestBlocker: string | null;
  createdAt: string;
  updatedAt: string;
}
interface LocalDb {
  quarters: RawQuarter[];
  goals: RawGoal[];
  habits: RawHabit[];
  reviews: RawReview[];
}

const emptyDb = (): LocalDb => ({ quarters: [], goals: [], habits: [], reviews: [] });

let db: LocalDb | null = null;

async function load(): Promise<LocalDb> {
  if (db) return db;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<LocalDb>) : {};
    db = {
      quarters: parsed.quarters ?? [],
      goals: parsed.goals ?? [],
      habits: parsed.habits ?? [],
      reviews: parsed.reviews ?? [],
    };
  } catch {
    db = emptyDb();
  }
  return db;
}

function persist(): void {
  if (db) void AsyncStorage.setItem(KEY, JSON.stringify(db));
}

// Local IDs are prefixed so a later cloud sync can tell them apart from server UUIDs.
function genId(): string {
  return `loc_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}
const today = (): string => toIsoDate(new Date());
const blankToNull = (v: string | null | undefined): string | null => {
  const t = (v ?? "").trim();
  return t.length ? t : null;
};
const notFound = (what: string): never => {
  throw new Error(`${what} not found`);
};

// ---- derived-view builders (mirror the backend services) ----

function goalsProgressOf(goals: { done: boolean }[]): number | null {
  return goals.length ? average(goals.map((g) => (g.done ? 100 : 0))) : null;
}

function buildQuarter(d: LocalDb, q: RawQuarter, todayIso: string): Quarter {
  const b = quarterBounds(q.year, q.quarterNumber);
  const p = quarterProgress(q.year, q.quarterNumber, todayIso);
  const goals = d.goals.filter((g) => g.quarterId === q.id).sort((a, z) => a.week - z.week);
  const goalDtos: Goal[] = goals.map((g) => ({
    id: g.id,
    title: g.title,
    week: g.week,
    done: g.done,
    status: computeGoalStatus(g.done, p.state, g.week, p.currentWeek),
  }));
  const gp = goalsProgressOf(goals);

  const activeHabits = d.habits.filter((h) => h.active);
  const started = todayIso >= b.startIso;
  const windowEnd = todayIso <= b.endIso ? todayIso : b.endIso;
  const habits: QuarterHabit[] = activeHabits.map((h) => {
    const comps = new Set(h.completionDates);
    const effStart = b.startIso > h.startDate ? b.startIso : h.startDate;
    return {
      id: h.id,
      name: h.name,
      currentStreak: currentStreak(todayIso, comps),
      completedToday: comps.has(todayIso),
      completionRate: started ? rateInWindow(comps, effStart, windowEnd) : 0,
    };
  });
  const consistency = activeHabits.length === 0 || !started ? null : average(habits.map((h) => h.completionRate));

  return {
    id: q.id,
    year: q.year,
    quarterNumber: q.quarterNumber,
    label: quarterLabel(q.quarterNumber),
    title: q.title,
    objective: q.objective,
    state: p.state,
    startDate: b.startIso,
    endDate: b.endIso,
    totalDays: p.totalDays,
    totalWeeks: p.totalWeeks,
    currentDay: p.currentDay,
    currentWeek: p.currentWeek,
    sprintScore: combineScore(gp, consistency),
    goalsProgress: gp ?? 0,
    habitsConsistency: consistency ?? 0,
    goals: goalDtos,
    habits,
  };
}

function buildDashboard(d: LocalDb, year: number, todayIso: string): YearDashboard {
  const activeHabits = d.habits.filter((h) => h.active);
  const tiles: QuarterTile[] = [];
  for (let q = 1; q <= 4; q++) {
    const p = quarterProgress(year, q, todayIso);
    const b = quarterBounds(year, q);
    const label = quarterLabel(q);
    const quarter = d.quarters.find((x) => x.year === year && x.quarterNumber === q);
    if (!quarter) {
      tiles.push({
        quarterNumber: q, label, state: p.state, planned: false, quarterId: null, title: null,
        score: null, currentDay: p.currentDay, totalDays: p.totalDays, goalCount: 0,
      });
      continue;
    }
    const goals = d.goals.filter((g) => g.quarterId === quarter.id);
    const gp = goalsProgressOf(goals);
    const started = todayIso >= b.startIso;
    const windowEnd = todayIso <= b.endIso ? todayIso : b.endIso;
    const consistency =
      activeHabits.length === 0 || !started
        ? null
        : average(
            activeHabits.map((h) => {
              const comps = new Set(h.completionDates);
              const effStart = b.startIso > h.startDate ? b.startIso : h.startDate;
              return rateInWindow(comps, effStart, windowEnd);
            }),
          );
    tiles.push({
      quarterNumber: q, label, state: p.state, planned: true, quarterId: quarter.id, title: quarter.title,
      score: p.state === "UPCOMING" ? null : combineScore(gp, consistency),
      currentDay: p.currentDay, totalDays: p.totalDays, goalCount: goals.length,
    });
  }
  return { year, quarters: tiles };
}

function buildReport(d: LocalDb, q: RawQuarter, todayIso: string): QuarterReport {
  const b = quarterBounds(q.year, q.quarterNumber);
  const started = todayIso >= b.startIso;
  const windowEnd = todayIso <= b.endIso ? todayIso : b.endIso;
  const goals = d.goals.filter((g) => g.quarterId === q.id).sort((a, z) => a.week - z.week);
  const gp = goalsProgressOf(goals);

  const activeHabits = d.habits.filter((h) => h.active);
  const rates: number[] = [];
  const highlights = activeHabits.map((h) => {
    const comps = new Set(h.completionDates);
    const effStart = b.startIso > h.startDate ? b.startIso : h.startDate;
    const rate = started ? rateInWindow(comps, effStart, windowEnd) : 0;
    rates.push(rate);
    const inQuarter = new Set([...comps].filter((dt) => dt >= b.startIso && dt <= b.endIso));
    return { name: h.name, completionRate: rate, longestStreak: longestStreak(inQuarter) };
  });
  const consistency = activeHabits.length === 0 || !started ? null : average(rates);

  return {
    id: q.id,
    year: q.year,
    quarterNumber: q.quarterNumber,
    label: quarterLabel(q.quarterNumber),
    title: q.title,
    objective: q.objective,
    sprintScore: combineScore(gp, consistency),
    goalsProgress: gp ?? 0,
    habitsConsistency: consistency ?? 0,
    goals: goals.map((g) => ({ title: g.title, week: g.week, met: g.done })),
    habits: highlights,
    reviewsCompleted: d.reviews.filter((r) => r.quarterId === q.id).length,
    totalWeeks: quarterTotalWeeks(b.totalDays),
  };
}

function buildHabit(h: RawHabit, todayIso: string): Habit {
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    color: h.color,
    startDate: h.startDate,
    active: h.active,
    completionDates: [...h.completionDates],
    ...habitStats(h.startDate, todayIso, h.completionDates),
  };
}

function goalDto(d: LocalDb, g: RawGoal, todayIso: string): Goal {
  const q = d.quarters.find((x) => x.id === g.quarterId);
  const p = q ? quarterProgress(q.year, q.quarterNumber, todayIso) : null;
  return {
    id: g.id,
    title: g.title,
    week: g.week,
    done: g.done,
    status: computeGoalStatus(g.done, p?.state ?? "UPCOMING", g.week, p?.currentWeek ?? null),
  };
}

function reviewDto(r: RawReview): WeeklyReview {
  return {
    id: r.id,
    weekNumber: r.weekNumber,
    wentWell: r.wentWell,
    wastedTime: r.wastedTime,
    biggestWin: r.biggestWin,
    biggestBlocker: r.biggestBlocker,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ---- the backend implementation ----

const localBackend: LocalBackend = {
  async dashboard(year) {
    const d = await load();
    return buildDashboard(d, year ?? new Date().getFullYear(), today());
  },
  async getQuarter(id) {
    const d = await load();
    const q = d.quarters.find((x) => x.id === id) ?? notFound("Quarter");
    return buildQuarter(d, q, today());
  },
  async currentQuarter() {
    const d = await load();
    const t = today();
    const q = d.quarters.find((x) => `${x.year}` === t.slice(0, 4) && x.quarterNumber === Math.floor(new Date().getMonth() / 3) + 1)
      ?? notFound("No quarter planned for the current period");
    return buildQuarter(d, q, t);
  },
  async report(id) {
    const d = await load();
    const q = d.quarters.find((x) => x.id === id) ?? notFound("Quarter");
    return buildReport(d, q, today());
  },
  async createQuarter(input: CreateQuarterInput) {
    const d = await load();
    if (d.quarters.some((x) => x.year === input.year && x.quarterNumber === input.quarterNumber)) {
      throw new Error("That quarter is already planned");
    }
    const q: RawQuarter = {
      id: genId(), year: input.year, quarterNumber: input.quarterNumber,
      title: blankToNull(input.title), objective: blankToNull(input.objective),
    };
    d.quarters.push(q);
    persist();
    return buildQuarter(d, q, today());
  },
  async updateQuarter(id, input: UpdateQuarterInput) {
    const d = await load();
    const q = d.quarters.find((x) => x.id === id) ?? notFound("Quarter");
    if ("title" in input) q.title = blankToNull(input.title);
    if ("objective" in input) q.objective = blankToNull(input.objective);
    persist();
    return buildQuarter(d, q, today());
  },
  async removeQuarter(id) {
    const d = await load();
    d.quarters = d.quarters.filter((x) => x.id !== id);
    d.goals = d.goals.filter((g) => g.quarterId !== id);
    d.reviews = d.reviews.filter((r) => r.quarterId !== id);
    persist();
  },
  async addGoal(quarterId, input: CreateGoalInput) {
    const d = await load();
    const g: RawGoal = { id: genId(), quarterId, title: input.title.trim(), week: input.week, done: false };
    d.goals.push(g);
    persist();
    return goalDto(d, g, today());
  },
  async updateGoal(quarterId, goalId, input: UpdateGoalInput) {
    const d = await load();
    const g = d.goals.find((x) => x.id === goalId && x.quarterId === quarterId) ?? notFound("Goal");
    if (input.title !== undefined) g.title = input.title.trim();
    if (input.week !== undefined) g.week = input.week;
    if (input.done !== undefined) g.done = input.done;
    persist();
    return goalDto(d, g, today());
  },
  async removeGoal(quarterId, goalId) {
    const d = await load();
    d.goals = d.goals.filter((g) => !(g.id === goalId && g.quarterId === quarterId));
    persist();
  },
  async listHabits() {
    const d = await load();
    const t = today();
    return d.habits
      .slice()
      .sort((a, z) => a.createdAt.localeCompare(z.createdAt))
      .map((h) => buildHabit(h, t));
  },
  async getHabit(id) {
    const d = await load();
    const h = d.habits.find((x) => x.id === id) ?? notFound("Habit");
    return buildHabit(h, today());
  },
  async createHabit(input: CreateHabitInput) {
    const d = await load();
    const t = today();
    const h: RawHabit = {
      id: genId(), name: input.name.trim(), description: blankToNull(input.description),
      color: input.color ?? null, startDate: input.startDate ?? t, active: true,
      completionDates: [], createdAt: new Date().toISOString(),
    };
    d.habits.push(h);
    persist();
    return buildHabit(h, t);
  },
  async updateHabit(id, input: UpdateHabitInput) {
    const d = await load();
    const h = d.habits.find((x) => x.id === id) ?? notFound("Habit");
    if (input.name !== undefined) h.name = input.name.trim();
    if (input.description !== undefined) h.description = blankToNull(input.description);
    if (input.color !== undefined) h.color = input.color;
    if (input.active !== undefined) h.active = input.active;
    persist();
    return buildHabit(h, today());
  },
  async removeHabit(id) {
    const d = await load();
    d.habits = d.habits.filter((x) => x.id !== id);
    persist();
  },
  async toggleToday(id) {
    const d = await load();
    const h = d.habits.find((x) => x.id === id) ?? notFound("Habit");
    const t = today();
    h.completionDates = h.completionDates.includes(t)
      ? h.completionDates.filter((x) => x !== t)
      : [...h.completionDates, t];
    persist();
    return buildHabit(h, t);
  },
  async markDate(id, date) {
    const d = await load();
    const h = d.habits.find((x) => x.id === id) ?? notFound("Habit");
    if (!h.completionDates.includes(date)) h.completionDates.push(date);
    persist();
    return buildHabit(h, today());
  },
  async unmarkDate(id, date) {
    const d = await load();
    const h = d.habits.find((x) => x.id === id) ?? notFound("Habit");
    h.completionDates = h.completionDates.filter((x) => x !== date);
    persist();
    return buildHabit(h, today());
  },
  async analytics(): Promise<Analytics> {
    const d = await load();
    return computeAnalytics(today(), d.habits.map((h) => h.completionDates));
  },
  async listReviews(quarterId) {
    const d = await load();
    return d.reviews
      .filter((r) => r.quarterId === quarterId)
      .sort((a, z) => a.weekNumber - z.weekNumber)
      .map(reviewDto);
  },
  async saveReview(quarterId, weekNumber, input: WeeklyReviewInput) {
    const d = await load();
    const now = new Date().toISOString();
    let r = d.reviews.find((x) => x.quarterId === quarterId && x.weekNumber === weekNumber);
    if (!r) {
      r = {
        id: genId(), quarterId, weekNumber, wentWell: null, wastedTime: null,
        biggestWin: null, biggestBlocker: null, createdAt: now, updatedAt: now,
      };
      d.reviews.push(r);
    }
    r.wentWell = blankToNull(input.wentWell);
    r.wastedTime = blankToNull(input.wastedTime);
    r.biggestWin = blankToNull(input.biggestWin);
    r.biggestBlocker = blankToNull(input.biggestBlocker);
    r.updatedAt = now;
    persist();
    return reviewDto(r);
  },
};

configureLocalBackend(localBackend);

// ---- guest-data adoption helpers (Phase 2: upload local data to the cloud on sign-in) ----

/** True if the guest has any local data worth uploading. */
export async function hasLocalData(): Promise<boolean> {
  const d = await load();
  return d.quarters.length > 0 || d.habits.length > 0;
}

/** Flatten the local DB into the upload payload (goals + reviews nested under their quarter). */
export async function exportLocalData(): Promise<GuestExport> {
  const d = await load();
  return {
    quarters: d.quarters.map((q) => ({
      year: q.year,
      quarterNumber: q.quarterNumber,
      title: q.title,
      objective: q.objective,
      goals: d.goals
        .filter((g) => g.quarterId === q.id)
        .map((g) => ({ title: g.title, week: g.week, done: g.done })),
      reviews: d.reviews
        .filter((r) => r.quarterId === q.id)
        .map((r) => ({
          weekNumber: r.weekNumber,
          wentWell: r.wentWell,
          wastedTime: r.wastedTime,
          biggestWin: r.biggestWin,
          biggestBlocker: r.biggestBlocker,
        })),
    })),
    habits: d.habits.map((h) => ({
      name: h.name,
      description: h.description,
      color: h.color,
      startDate: h.startDate,
      active: h.active,
      completionDates: [...h.completionDates],
    })),
  };
}

/** Wipe the local DB (called after a successful upload — the data now lives in the cloud). */
export async function clearLocalData(): Promise<void> {
  db = emptyDb();
  await AsyncStorage.setItem(KEY, JSON.stringify(db));
}
