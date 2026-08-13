const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const send401 = (res) => {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "No user is authenticated." });
};

module.exports = (req, res, next) => {
  const token = req?.cookies?.session_token;
  if (!token) {
    return send401(res);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return send401(res);
    }
    req.user = { id: decoded.id, role: decoded.role };
    // this is where the id is kept for subsequent use in access control.
    if (["POST", "PATCH", "PUT", "DELETE", "CONNECT"].includes(req.method)) {
      // for these operations we have to check for cross site request forgery
      const csrfHeader = req.get("X-CSRF-TOKEN") || req.get("x-csrf-token");
      if (!csrfHeader || csrfHeader !== decoded.csrfToken) {
        return send401(res);
      }
    }
    return next();
  });
};
