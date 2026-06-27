import { apiClient } from "@/lib/api/client";
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
  dashboard: (year?: number) =>
    apiClient.get<YearDashboard>(`/api/v1/dashboard${year ? `?year=${year}` : ""}`),

  get: (id: string) => apiClient.get<Quarter>(`${BASE}/${id}`),

  report: (id: string) => apiClient.get<QuarterReport>(`${BASE}/${id}/report`),

  create: (input: CreateQuarterInput) => apiClient.post<Quarter>(BASE, input),

  update: (id: string, input: UpdateQuarterInput) =>
    apiClient.patch<Quarter>(`${BASE}/${id}`, input),

  remove: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  addGoal: (quarterId: string, input: CreateGoalInput) =>
    apiClient.post<Goal>(`${BASE}/${quarterId}/goals`, input),

  updateGoal: (quarterId: string, goalId: string, input: UpdateGoalInput) =>
    apiClient.patch<Goal>(`${BASE}/${quarterId}/goals/${goalId}`, input),

  removeGoal: (quarterId: string, goalId: string) =>
    apiClient.delete<void>(`${BASE}/${quarterId}/goals/${goalId}`),
};
