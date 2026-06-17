import { apiClient } from "@/lib/api/client";
import type {
  CreateCycleInput,
  CreateGoalInput,
  Cycle,
  CycleSummary,
  Goal,
  UpdateCycleInput,
  UpdateGoalInput,
} from "./types";

const BASE = "/api/v1/cycles";

export const cycleApi = {
  list: () => apiClient.get<CycleSummary[]>(BASE),

  get: (id: string) => apiClient.get<Cycle>(`${BASE}/${id}`),

  getCurrent: () => apiClient.get<Cycle>(`${BASE}/current`),

  create: (input: CreateCycleInput) => apiClient.post<Cycle>(BASE, input),

  update: (id: string, input: UpdateCycleInput) =>
    apiClient.patch<Cycle>(`${BASE}/${id}`, input),

  remove: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  addGoal: (cycleId: string, input: CreateGoalInput) =>
    apiClient.post<Goal>(`${BASE}/${cycleId}/goals`, input),

  updateGoal: (cycleId: string, goalId: string, input: UpdateGoalInput) =>
    apiClient.patch<Goal>(`${BASE}/${cycleId}/goals/${goalId}`, input),

  removeGoal: (cycleId: string, goalId: string) =>
    apiClient.delete<void>(`${BASE}/${cycleId}/goals/${goalId}`),
};
