import type { Analytics } from "./analytics/types";
import type { CreateHabitInput, Habit, UpdateHabitInput } from "./habit/types";
import type {
  CreateGoalInput,
  CreateQuarterInput,
  Goal,
  Quarter,
  QuarterReport,
  UpdateGoalInput,
  UpdateQuarterInput,
  YearDashboard,
} from "./quarter/types";
import type { WeeklyReview, WeeklyReviewInput } from "./review/types";

/**
 * Local-first seam. When the app is in GUEST mode (no account), the API layer routes calls to a
 * registered LocalBackend instead of the network — so the entire app works with no server, storing
 * everything on-device. The mobile app registers an AsyncStorage-backed implementation; the web app
 * registers nothing (always remote). Method names mirror the api objects they stand in for.
 */
export interface LocalBackend {
  // quarters
  dashboard(year?: number): Promise<YearDashboard>;
  getQuarter(id: string): Promise<Quarter>;
  currentQuarter(): Promise<Quarter>;
  report(id: string): Promise<QuarterReport>;
  createQuarter(input: CreateQuarterInput): Promise<Quarter>;
  updateQuarter(id: string, input: UpdateQuarterInput): Promise<Quarter>;
  removeQuarter(id: string): Promise<void>;
  addGoal(quarterId: string, input: CreateGoalInput): Promise<Goal>;
  updateGoal(quarterId: string, goalId: string, input: UpdateGoalInput): Promise<Goal>;
  removeGoal(quarterId: string, goalId: string): Promise<void>;
  // habits
  listHabits(): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit>;
  createHabit(input: CreateHabitInput): Promise<Habit>;
  updateHabit(id: string, input: UpdateHabitInput): Promise<Habit>;
  removeHabit(id: string): Promise<void>;
  toggleToday(id: string): Promise<Habit>;
  markDate(id: string, date: string): Promise<Habit>;
  unmarkDate(id: string, date: string): Promise<Habit>;
  // analytics
  analytics(): Promise<Analytics>;
  // reviews
  listReviews(quarterId: string): Promise<WeeklyReview[]>;
  saveReview(quarterId: string, weekNumber: number, input: WeeklyReviewInput): Promise<WeeklyReview>;
}

let backend: LocalBackend | null = null;
let guest = false;

/** Register the platform local backend (mobile). Pass null to unregister. */
export function configureLocalBackend(b: LocalBackend | null): void {
  backend = b;
}

/** Toggle guest mode on/off (set by auth: on when there's no account, off when logged in). */
export function setGuestMode(on: boolean): void {
  guest = on;
}

export function isGuestMode(): boolean {
  return guest;
}

/** The local backend to use right now, or null when we should hit the network. */
export function guestBackend(): LocalBackend | null {
  return guest && backend ? backend : null;
}
