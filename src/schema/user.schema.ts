import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const userUpdateSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  otp: z.string().nullable().optional(),
  isVerified: z.boolean().optional(),
  resetToken: z.string().nullable().optional(),
  resetTokenExpires: z.date().nullable().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});
