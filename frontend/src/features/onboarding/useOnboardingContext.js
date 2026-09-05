import { createContext, use } from "react";

export const OnboardingContext = createContext(null);

export function useOnboarding() {
  const context = use(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
