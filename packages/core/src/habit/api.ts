import { apiClient } from "../api/client";
import type { CreateHabitInput, Habit, UpdateHabitInput } from "./types";

const BASE = "/api/v1/habits";

export const habitApi = {
  list: () => apiClient.get<Habit[]>(BASE),

  get: (id: string) => apiClient.get<Habit>(`${BASE}/${id}`),

  create: (input: CreateHabitInput) => apiClient.post<Habit>(BASE, input),

  update: (id: string, input: UpdateHabitInput) =>
    apiClient.patch<Habit>(`${BASE}/${id}`, input),

  remove: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  /** Toggle today's completion (server resolves "today" in the user's timezone). */
  toggleToday: (id: string) => apiClient.post<Habit>(`${BASE}/${id}/today`),

  markDate: (id: string, date: string) =>
    apiClient.put<Habit>(`${BASE}/${id}/completions/${date}`),

  unmarkDate: (id: string, date: string) =>
    apiClient.delete<Habit>(`${BASE}/${id}/completions/${date}`),
};
