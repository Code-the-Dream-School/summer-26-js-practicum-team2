import { z } from "zod";

const LONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const SHORT_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).+$/;
const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 15 characters long and include upper and lower case letters and a number, or at least 8 characters long and include upper and lower case letters, a number, and a special character.";

// Shared email validation used across sign-in and account recovery flows.
const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please provide a valid email address.");

const passwordField = z
  .string()
  .trim()
  .min(1, "Password is required.")
  .refine((value) => {
    const isLongPassword = value.length >= 15 && LONG_PASSWORD_PATTERN.test(value);
    const isShortPassword = value.length >= 8 && SHORT_PASSWORD_PATTERN.test(value);
    return isLongPassword || isShortPassword;
  }, PASSWORD_POLICY_MESSAGE);

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
