const mockUse = jest.fn();
const mockGoogleStrategy = jest.fn();
const mockGitHubStrategy = jest.fn();
const mockFindOrCreateOAuthUser = jest.fn();

jest.mock("passport", () => ({ use: mockUse }));
jest.mock("passport-google-oauth20", () => ({ Strategy: mockGoogleStrategy }));
jest.mock("passport-github2", () => ({ Strategy: mockGitHubStrategy }));
jest.mock("../src/services/oauthUser.service.js", () => ({
  findOrCreateOAuthUser: mockFindOrCreateOAuthUser,
}));

process.env.GOOGLE_CLIENT_ID = "google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
process.env.GITHUB_CLIENT_ID = "github-client-id";
process.env.GITHUB_CLIENT_SECRET = "github-client-secret";

require("../src/config/passport.js");

describe("Passport OAuth configuration", () => {
  beforeEach(() => {
    mockFindOrCreateOAuthUser.mockClear();
  });

  it("configures GitHub to retrieve all raw email records with the user:email scope", async () => {
    const [options, verify] = mockGitHubStrategy.mock.calls[0];
    const done = jest.fn();
    const user = { _id: "github-user" };
    const profile = {
      id: "github-provider-id",
      username: "github-user",
      emails: [
        { value: "secondary@example.com", verified: true, primary: false },
        { value: "primary@example.com", verified: true, primary: true },
      ],
      photos: [{ value: "https://avatars.githubusercontent.com/u/123" }],
    };
    mockFindOrCreateOAuthUser.mockResolvedValue(user);

    expect(options).toMatchObject({
      scope: ["user:email"],
      allRawEmails: true,
      passReqToCallback: true,
    });

    await verify({ oauth: { tosAccepted: true } }, "access", "refresh", profile, done);

    expect(mockFindOrCreateOAuthUser).toHaveBeenCalledWith({
      provider: "github",
      providerId: "github-provider-id",
      name: "github-user",
      emails: profile.emails,
      photos: profile.photos,
      tosAccepted: true,
    });
    expect(done).toHaveBeenCalledWith(null, user);
  });

  it("passes Google email verification data through to the OAuth user service", async () => {
    const [options, verify] = mockGoogleStrategy.mock.calls[0];
    const done = jest.fn();
    const profile = {
      id: "google-provider-id",
      displayName: "Google User",
      emails: [{ value: "google@example.com", verified: true }],
      photos: [{ value: "https://lh3.googleusercontent.com/avatar" }],
    };
    mockFindOrCreateOAuthUser.mockResolvedValue({ _id: "google-user" });

    expect(options).toMatchObject({
      scope: ["profile", "email"],
      passReqToCallback: true,
    });

    await verify({ oauth: { tosAccepted: false } }, "access", "refresh", profile, done);

    expect(mockFindOrCreateOAuthUser).toHaveBeenCalledWith({
      provider: "google",
      providerId: "google-provider-id",
      name: "Google User",
      emails: profile.emails,
      photos: profile.photos,
      tosAccepted: false,
    });
  });
});
