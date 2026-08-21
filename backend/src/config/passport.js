const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User.model.js");

const API_URL = process.env.API_URL || "http://localhost:8080";

// Finds an existing user by provider id or email, otherwise creates a new one.
const findOrCreateOAuthUser = async ({ providerField, providerId, name, email }) => {
  let user = await User.findOne({ [providerField]: providerId });
  if (user) return user;

  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user[providerField] = providerId;
      await user.save();
      return user;
    }
  }

  return User.create({
    name: name || email || "Sprout User",
    email,
    [providerField]: providerId,
    role: "learner",
    tos_agreement: true,
    tos_agreement_at: new Date(),
    email_verified_at: new Date(),
  });
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${API_URL}/api/v1/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const user = await findOrCreateOAuthUser({
            providerField: "google_id",
            providerId: profile.id,
            name: profile.displayName,
            email,
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || `${API_URL}/api/v1/auth/github/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // GitHub only returns a primary email when the "user:email" scope is granted.
          const email = profile.emails?.[0]?.value;
          const user = await findOrCreateOAuthUser({
            providerField: "github_id",
            providerId: profile.id,
            name: profile.displayName || profile.username,
            email,
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}

module.exports = passport;
