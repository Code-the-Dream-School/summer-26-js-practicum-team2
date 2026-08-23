// Adds the bearer token used for authenticated API requests.
function withAuth(req, authHeader) {
  return req.set("Authorization", authHeader);
}

// Adds the session cookie and matching CSRF token needed for cookie-authenticated requests.
function withSessionCsrf(req, token, csrfToken = "test-csrf") {
  return req.set("Cookie", [`session_token=${token}`]).set("x-csrf-token", csrfToken);
}

module.exports = {
  withAuth,
  withSessionCsrf,
};