import { useId } from "react";

const stateClasses = {
  default:
    "border-neutral-200 bg-surface-input text-foreground placeholder:text-neutral-500 focus:border-primary focus:ring-primary/20",
  error:
    "border-danger bg-surface-input text-foreground placeholder:text-neutral-500 focus:border-danger focus:ring-danger/20",
  disabled: "border-neutral-200 bg-surface-raised text-neutral-500 placeholder:text-neutral-400",
};

export function useFieldA11y({ id, helperText, error, disabled }) {
  // Generate a stable ID when the consumer does not provide one, so labels
  // and assistive-text references remain connected across renders.
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  // Only create references for messages that are actually rendered.
  const helperTextId = helperText ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  let variant = "default";
  if (error) variant = "error";
  // Disabled styling takes precedence when both disabled and error are set.
  if (disabled) variant = "disabled";

  return {
    fieldId,
    helperTextId,
    errorId,
    // Screen readers use this space-separated list to read both messages.
    describedBy: [helperTextId, errorId].filter(Boolean).join(" ") || undefined,
    stateClass: stateClasses[variant],
  };
}
