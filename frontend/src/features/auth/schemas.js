import { z } from "zod";

// Strong password requirement: must contain lowercase, uppercase, a number, and a symbol.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

// Shared email validation used across sign-in and account recovery flows.
const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please provide a valid email address.");

const passwordField = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long.")
  .regex(
    PASSWORD_PATTERN,
    "Password must include upper and lower case letters, a number, and a special character.",
  );

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long.")
      .max(30, "Name cannot be longer than 30 characters."),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().trim().min(1, "Please confirm password."),
    tos: z.boolean().refine((v) => v === true, {
      message: "Please accept the terms of service.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const requestResetSchema = z.object({ email: emailField });

export const confirmResetSchema = z.object({ password: passwordField });
