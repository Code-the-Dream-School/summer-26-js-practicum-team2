const OAUTH_PROVIDER_SCOPES = Object.freeze({
  google: ["profile", "email"],
  github: ["user:email"],
});

const OAUTH_PROVIDER_CREDENTIALS = Object.freeze({
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  github: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
});

const isOAuthProviderEnabled = (provider) => {
  const credentialNames = OAUTH_PROVIDER_CREDENTIALS[provider];
  return Boolean(credentialNames?.every((credentialName) => process.env[credentialName]));
};

const getEnabledOAuthProviders = () =>
  Object.fromEntries(
    Object.keys(OAUTH_PROVIDER_SCOPES).map((provider) => [
      provider,
      isOAuthProviderEnabled(provider),
    ]),
  );

module.exports = {
  OAUTH_PROVIDER_SCOPES,
  getEnabledOAuthProviders,
  isOAuthProviderEnabled,
};
