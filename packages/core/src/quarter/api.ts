import { apiClient } from "../api/client";
import { guestBackend } from "../local-backend";
import type {
  CreateGoalInput,
  CreateQuarterInput,
  Goal,
  Quarter,
  QuarterReport,
  UpdateGoalInput,
  UpdateQuarterInput,
  YearDashboard,
} from "./types";

const BASE = "/api/v1/quarters";

export const quarterApi = {
  /** The 2×2 year overview; omit year for the current year. */
  dashboard: (year?: number) => {
    const g = guestBackend();
    return g ? g.dashboard(year) : apiClient.get<YearDashboard>(`/api/v1/dashboard${year ? `?year=${year}` : ""}`);
  },

  get: (id: string) => {
    const g = guestBackend();
    return g ? g.getQuarter(id) : apiClient.get<Quarter>(`${BASE}/${id}`);
  },

  /** The quarter containing today (rejects if it isn't planned). */
  current: () => {
    const g = guestBackend();
    return g ? g.currentQuarter() : apiClient.get<Quarter>(`${BASE}/current`);
  },

  report: (id: string) => {
    const g = guestBackend();
    return g ? g.report(id) : apiClient.get<QuarterReport>(`${BASE}/${id}/report`);
  },

  create: (input: CreateQuarterInput) => {
    const g = guestBackend();
    return g ? g.createQuarter(input) : apiClient.post<Quarter>(BASE, input);
  },

  update: (id: string, input: UpdateQuarterInput) => {
    const g = guestBackend();
    return g ? g.updateQuarter(id, input) : apiClient.patch<Quarter>(`${BASE}/${id}`, input);
  },

  remove: (id: string) => {
    const g = guestBackend();
    return g ? g.removeQuarter(id) : apiClient.delete<void>(`${BASE}/${id}`);
  },

  addGoal: (quarterId: string, input: CreateGoalInput) => {
    const g = guestBackend();
    return g ? g.addGoal(quarterId, input) : apiClient.post<Goal>(`${BASE}/${quarterId}/goals`, input);
  },

  updateGoal: (quarterId: string, goalId: string, input: UpdateGoalInput) => {
    const g = guestBackend();
    return g ? g.updateGoal(quarterId, goalId, input) : apiClient.patch<Goal>(`${BASE}/${quarterId}/goals/${goalId}`, input);
  },

  removeGoal: (quarterId: string, goalId: string) => {
    const g = guestBackend();
    return g ? g.removeGoal(quarterId, goalId) : apiClient.delete<void>(`${BASE}/${quarterId}/goals/${goalId}`);
  },
};
