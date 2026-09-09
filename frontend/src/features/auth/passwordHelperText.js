const SHORT_PASSWORD_HELPER_TEXT =
  "Use 8+ characters with upper and lower case letters, a number, and a symbol.";
const LONG_PASSWORD_HELPER_TEXT =
  "Use 15+ characters with upper and lower case letters plus a number.";

export function getPasswordHelperText(password = "") {
  return password.length >= 15 ? LONG_PASSWORD_HELPER_TEXT : SHORT_PASSWORD_HELPER_TEXT;
}

export { SHORT_PASSWORD_HELPER_TEXT, LONG_PASSWORD_HELPER_TEXT };
