import { useOnboarding as useOnboardingState } from "./useOnboarding";
import { OnboardingContext } from "./useOnboardingContext";

export function OnboardingProvider({ children }) {
  const onboarding = useOnboardingState();
  return <OnboardingContext value={onboarding}>{children}</OnboardingContext>;
}
