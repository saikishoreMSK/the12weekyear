import { habitApi } from "./habit/api";
import { quarterApi } from "./quarter/api";
import { reviewApi } from "./review/api";

/** Years to scan when snapshotting cloud data back to the device (prev / current / next). */
function snapshotYears(): number[] {
  const y = new Date().getFullYear();
  return [y - 1, y, y + 1];
}

/**
 * Snapshot the signed-in user's cloud data into a GuestExport (the inverse of replayImport). Used at
 * sign-out so guest mode isn't empty — the local store is seeded with the account's current data.
 * Must run while authenticated (remote mode). Scans the current year ±1 for planned quarters.
 */
export async function exportCloudData(): Promise<GuestExport> {
  const habitList = await habitApi.list();
  const habits = habitList.map((h) => ({
    name: h.name,
    description: h.description,
    color: h.color,
    startDate: h.startDate,
    active: h.active,
    completionDates: [...h.completionDates],
  }));

  const quarters: GuestExport["quarters"] = [];
  for (const y of snapshotYears()) {
    const dash = await quarterApi.dashboard(y);
    for (const tile of dash.quarters) {
      if (!tile.planned || !tile.quarterId) continue;
      const detail = await quarterApi.get(tile.quarterId);
      const reviews = await reviewApi.list(tile.quarterId);
      quarters.push({
        year: detail.year,
        quarterNumber: detail.quarterNumber,
        title: detail.title,
        objective: detail.objective,
        goals: detail.goals.map((g) => ({ title: g.title, week: g.week, done: g.done })),
        reviews: reviews.map((r) => ({
          weekNumber: r.weekNumber,
          wentWell: r.wentWell,
          wastedTime: r.wastedTime,
          biggestWin: r.biggestWin,
          biggestBlocker: r.biggestBlocker,
        })),
      });
    }
  }
  return { quarters, habits };
}

/** A guest's on-device data, flattened for upload (goals + reviews nested under their quarter). */
export interface GuestExport {
  quarters: {
    year: number;
    quarterNumber: number;
    title: string | null;
    objective: string | null;
    goals: { title: string; week: number; done: boolean }[];
    reviews: {
      weekNumber: number;
      wentWell: string | null;
      wastedTime: string | null;
      biggestWin: string | null;
      biggestBlocker: string | null;
    }[];
  }[];
  habits: {
    name: string;
    description: string | null;
    color: string | null;
    startDate: string;
    active: boolean;
    completionDates: string[];
  }[];
}

/**
 * One-way local→cloud adoption (Phase 2): replay a guest's local data into their account using the
 * EXISTING write endpoints — no special backend needed, so it works against the deployed API.
 *
 * Idempotent by design, so a retry (or a partially-failed run) can't create duplicates:
 *  - quarters deduped by (year, quarterNumber) via the dashboard,
 *  - goals deduped by week within a quarter,
 *  - habits deduped by name,
 *  - completions are set-state (PUT), and reviews are upserts (PUT by week).
 *
 * Must run while authenticated (remote mode) — the api routes to the cloud, not the local backend.
 */
export async function replayImport(data: GuestExport): Promise<void> {
  // Habits (+ their completions) first.
  const existingHabits = await habitApi.list();
  const habitByName = new Map(existingHabits.map((h) => [h.name, h]));
  for (const h of data.habits) {
    let target = habitByName.get(h.name);
    if (!target) {
      target = await habitApi.create({
        name: h.name,
        description: h.description ?? undefined,
        color: h.color ?? undefined,
        startDate: h.startDate,
      });
    }
    const have = new Set(target.completionDates);
    for (const date of h.completionDates) {
      if (!have.has(date)) await habitApi.markDate(target.id, date);
    }
    if (!h.active && target.active) await habitApi.update(target.id, { active: false });
  }

  // Quarters → goals → reviews.
  const years = [...new Set(data.quarters.map((q) => q.year))];
  const existingQuarterId = new Map<string, string>();
  for (const y of years) {
    const dash = await quarterApi.dashboard(y);
    for (const t of dash.quarters) {
      if (t.quarterId) existingQuarterId.set(`${y}:${t.quarterNumber}`, t.quarterId);
    }
  }
  for (const q of data.quarters) {
    let id = existingQuarterId.get(`${q.year}:${q.quarterNumber}`);
    if (!id) {
      const created = await quarterApi.create({
        year: q.year,
        quarterNumber: q.quarterNumber,
        title: q.title ?? undefined,
        objective: q.objective ?? undefined,
      });
      id = created.id;
    }
    const detail = await quarterApi.get(id);
    const haveWeeks = new Set(detail.goals.map((g) => g.week));
    for (const g of q.goals) {
      if (haveWeeks.has(g.week)) continue;
      const goal = await quarterApi.addGoal(id, { title: g.title, week: g.week });
      if (g.done) await quarterApi.updateGoal(id, goal.id, { done: true });
    }
    for (const r of q.reviews) {
      await reviewApi.save(id, r.weekNumber, {
        wentWell: r.wentWell ?? undefined,
        wastedTime: r.wastedTime ?? undefined,
        biggestWin: r.biggestWin ?? undefined,
        biggestBlocker: r.biggestBlocker ?? undefined,
      });
    }
  }
}
