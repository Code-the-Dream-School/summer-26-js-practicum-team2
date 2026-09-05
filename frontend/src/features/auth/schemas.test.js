import { describe, expect, it } from "vitest";
import { confirmResetSchema, registerSchema } from "./schemas";

describe("auth password validation", () => {
  it("accepts long passwords without a special character", () => {
    const result = confirmResetSchema.safeParse({ password: "YxNqSSe9uqCCVAEx" });

    expect(result.success).toBe(true);
  });

  it("accepts 8+ character passwords with upper/lowercase, number, and symbol", () => {
    const result = confirmResetSchema.safeParse({ password: "StrongPass1!" });

    expect(result.success).toBe(true);
  });

  it("rejects passwords that only satisfy the symbol rule with whitespace", () => {
    const result = confirmResetSchema.safeParse({ password: "Password1 " });

    expect(result.success).toBe(false);
  });

  it("rejects long passwords that do not include a number", () => {
    const result = confirmResetSchema.safeParse({ password: "VeryLongPasswordWithoutDigits" });

    expect(result.success).toBe(false);
  });

  it("uses the same password policy in registration", () => {
    const result = registerSchema.safeParse({
      name: "Taylor",
      email: "taylor@example.com",
      password: "YxNqSSe9uqCCVAEx",
      confirmPassword: "YxNqSSe9uqCCVAEx",
      tos: true,
    });

    expect(result.success).toBe(true);
  });
});
