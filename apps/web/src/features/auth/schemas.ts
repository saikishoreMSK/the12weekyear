import { z } from "zod";

/** Client-side validation. Mirrors the backend Bean Validation rules so users get instant feedback. */

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(1, "Name is required")
    .max(80, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
