const User = require("../models/User.model.js");

const PROVIDER_FIELDS = Object.freeze({
  google: "google_id",
  github: "github_id",
});

class OAuthUserError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "OAuthUserError";
    this.code = code;
  }
}

const getProviderField = (provider) => {
  const providerField = PROVIDER_FIELDS[provider];
  if (!providerField) {
    throw new OAuthUserError("OAUTH_PROVIDER_INVALID", "OAuth provider is not supported.");
  }
  return providerField;
};

const selectVerifiedEmail = (emails) => {
  if (!Array.isArray(emails)) return null;

  const verifiedEmails = emails.filter(
    (entry) => entry?.verified === true && typeof entry.value === "string" && entry.value.trim(),
  );
  const emailEntry = verifiedEmails.find((entry) => entry.primary) || verifiedEmails[0];

  return emailEntry ? emailEntry.value.trim().toLowerCase() : null;
};

const findOrCreateOAuthUser = async ({ provider, providerId, name, emails, tosAccepted }) => {
  const providerField = getProviderField(provider);
  const normalizedProviderId = typeof providerId === "string" ? providerId.trim() : "";
  if (!normalizedProviderId) {
    throw new OAuthUserError("OAUTH_PROVIDER_ID_REQUIRED", "OAuth provider identity is missing.");
  }

  const email = selectVerifiedEmail(emails);
  if (!email) {
    throw new OAuthUserError(
      "OAUTH_VERIFIED_EMAIL_REQUIRED",
      `We need a verified email address from ${provider === "github" ? "GitHub" : "Google"} to create your Sprout account.`,
    );
  }

  const providerUser = await User.findOne({ [providerField]: normalizedProviderId });
  if (providerUser) return providerUser;

  const emailUser = await User.findOne({ email });
  if (emailUser) {
    if (emailUser[providerField] && emailUser[providerField] !== normalizedProviderId) {
      throw new OAuthUserError(
        "OAUTH_IDENTITY_CONFLICT",
        "This provider identity is already linked to a different Sprout account.",
      );
    }

    emailUser[providerField] = normalizedProviderId;
    await emailUser.save();
    return emailUser;
  }

  if (!tosAccepted) {
    throw new OAuthUserError(
      "OAUTH_TERMS_REQUIRED",
      "Please agree to the Terms of Service and Privacy Policy before creating an account.",
    );
  }

  return User.create({
    name: typeof name === "string" && name.trim() ? name.trim() : "Sprout User",
    email,
    [providerField]: normalizedProviderId,
    role: "learner",
    tos_agreement: true,
    tos_agreement_at: new Date(),
    email_verified_at: new Date(),
  });
};

module.exports = {
  OAuthUserError,
  findOrCreateOAuthUser,
  selectVerifiedEmail,
};
