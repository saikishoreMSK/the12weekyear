import { apiClient } from "../api/client";
import { guestBackend } from "../local-backend";
import type { CreateHabitInput, Habit, UpdateHabitInput } from "./types";

const BASE = "/api/v1/habits";

export const habitApi = {
  list: () => {
    const g = guestBackend();
    return g ? g.listHabits() : apiClient.get<Habit[]>(BASE);
  },

  get: (id: string) => {
    const g = guestBackend();
    return g ? g.getHabit(id) : apiClient.get<Habit>(`${BASE}/${id}`);
  },

  create: (input: CreateHabitInput) => {
    const g = guestBackend();
    return g ? g.createHabit(input) : apiClient.post<Habit>(BASE, input);
  },

  update: (id: string, input: UpdateHabitInput) => {
    const g = guestBackend();
    return g ? g.updateHabit(id, input) : apiClient.patch<Habit>(`${BASE}/${id}`, input);
  },

  remove: (id: string) => {
    const g = guestBackend();
    return g ? g.removeHabit(id) : apiClient.delete<void>(`${BASE}/${id}`);
  },

  /** Toggle today's completion. */
  toggleToday: (id: string) => {
    const g = guestBackend();
    return g ? g.toggleToday(id) : apiClient.post<Habit>(`${BASE}/${id}/today`);
  },

  markDate: (id: string, date: string) => {
    const g = guestBackend();
    return g ? g.markDate(id, date) : apiClient.put<Habit>(`${BASE}/${id}/completions/${date}`);
  },

  unmarkDate: (id: string, date: string) => {
    const g = guestBackend();
    return g ? g.unmarkDate(id, date) : apiClient.delete<Habit>(`${BASE}/${id}/completions/${date}`);
  },
};
