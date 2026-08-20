const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { sendVerificationEmail } = require("../utils/sendEmail.js");
//User is capitalized because it represents a model which is a collection of items forthe database
const User = require("../models/User.model.js");
const { hashPassword, comparePassword } = require("../utils/password.js");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateRequest,
} = require("../validation/userValidation.js");
const JWT_SECRET = process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const IS_DEV_ENV = process.env.NODE_ENV !== "production";

//we want  sameSite cookies to be lax as per userStory 2.1
const getCookieOptions = (_req, maxAge) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
  ...(maxAge !== undefined ? { maxAge } : {}),
});

//function register registers a new user document in MongoDB user story 2.1.6

const register = async (req, res, next) => {
  try {
    //validate input from request body versus Joi based schema
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      //return 400 if validation fails
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }
    //3. Check if user exists already using JOI userValidation )

    const { name, email, password } = value;

    // using Mongoose  to figure out if the user already exists
    const previousUser = await User.findOne({ email });
    if (previousUser) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Email already registered." });
    }
    const password_hash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    //record using mongoose model

    const newUser = await User.create({
      name,
      email,
      password_hash,
      role: "learner",
      tos_agreement: true,
      tos_agreement_at: new Date(),
      email_verified_at: null,
      verification_token: verificationToken,
      verification_token_expires_at: tokenExpiresAt,
    });
    const verifyUrl = `${CLIENT_URL}/verify?token=${verificationToken}`;

    await sendVerificationEmail(
      newUser.email,
      "Verify your email address",
      `Hello ${newUser.name || ""},\n\nPlease verify your account by clicking this link: ${verifyUrl}`,
      `<p>Hello ${newUser.name || "User"},</p>
    <p>Please Verify your account by clicking the link below:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link expires in 24 hours.</p>`,
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Registration successful. Please check for verification email.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tos_agreement: newUser.tos_agreement,
        tos_agreement_at: newUser.tos_agreement_at,
        created_at: newUser.createdAt || newUser.created_at,
      },
      ...(IS_DEV_ENV ? { devVerification: { token: verificationToken, verifyUrl } } : {}),
    });
  } catch (err) {
    return next(err);
  }
};
//user story 2.1.8 - Login

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }
    //Joi gives the sanitized input and the value is the output
    const { email, password, remember } = value;
    // LOok up in mongo database
    const user = await User.findOne({ email });
    if (!user) {
      req.app.emit?.("login_failed", {
        email,
        ip: req.ip,
        reason: "user_not_found",
      });
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid email or password." });
    }
    //compared hashed password

    const isMatched = await comparePassword(password, user.password_hash);
    if (!isMatched) {
      req.app.emit?.("login_failed", {
        email,
        userId: user._id,
        ip: req.ip,
        reason: "invalid_password",
      });
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid email or password." });
    }

    if (!user.email_verified_at) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Please verify your email before logging in." });
    }
    //Cookie time: and JWT expires 14Days default, 30Days if remember = true as per user story 2.1
    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const maxAge = remember ? THIRTY_DAYS : FOURTEEN_DAYS;
    const tokenExpiry = remember ? "30d" : "14d";

    //Sign JWT Token
    const csrfToken = crypto.randomUUID();
    const token = jwt.sign({ id: user._id, role: user.role, csrfToken }, JWT_SECRET, {
      expiresIn: tokenExpiry,
    });
    // HttpOnly session cookies
    res.cookie("session_token", token, getCookieOptions(req, maxAge));
    req.app.emit?.("login_success", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
    });

    return res.status(StatusCodes.OK).json({
      message: "Login successful!",
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// user story 2.1 -Post logout
//L8 clear cookies from most active session after user logs out so user's cookies cannot be used inappropriately

const logout = async (req, res) => {
  const { ...cookieOptions } = getCookieOptions(req);
  const hasSessionCookie = Boolean(req.cookies?.session_token);
  res.clearCookie("session_token", cookieOptions);

  if (!hasSessionCookie) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No user is authenticated." });
  }

  return res.status(StatusCodes.OK).json({ message: "Logout successful." });
};

// GET/ Verify -email
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: " Verification token is needed." });
    }
    const user = await User.findOne({
      verification_token: token,
      verification_token_expires_at: { $gt: new Date() },
    }).select("+verification_token");
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: " invalid or expired verification token." });
    }

    //Email is verified and clear token
    user.email_verified_at = new Date();
    user.verification_token = undefined;
    user.verification_token_expires_at = undefined;
    await user.save();

    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    const csrfToken = crypto.randomUUID();
    const sessionToken = jwt.sign({ id: user._id, role: user.role, csrfToken }, JWT_SECRET, {
      expiresIn: "14d",
    });

    res.cookie("session_token", sessionToken, getCookieOptions(req, FOURTEEN_DAYS));

    req.app.emit?.("login_success", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
    });

    return res.status(StatusCodes.OK).json({
      message: "Email verified successfully. You are now signed in.",
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};
const forgotPassword = async (req, res, next) => {
  try {
    const validatedBody = validateRequest(res, forgotPasswordSchema, req.body);
    if (!validatedBody) return;
    const { email } = validatedBody;
    const user = await User.findOne({ email }).select("+password_reset_token");
    if (!user) {
      return res.status(StatusCodes.OK).json({
        message:
          "If an account with the email exists, a password reset link will be provided to that email.",
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.password_reset_token = resetToken;
    user.password_reset_expires_at = resetTokenExpiresAt;
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendVerificationEmail(
      user.email,
      "Password Reset Request",
      `You requested a password reset. Please click this link: ${resetUrl}`,
      `<p>Hello ${user.name || "User"}, </p>
          <p>Here's your link to reset a new password:</p>
          <p><a href= "${resetUrl}" > ${resetUrl}</a></p>
          <p>Reset link will expire in 1 hour.</p>`,
    );
    return res.status(StatusCodes.OK).json({
      message:
        "If an account with the email exists, a password reset link will be provided to that email.",
      ...(IS_DEV_ENV ? { devPasswordReset: { token: resetToken, resetUrl } } : {}),
    });
  } catch (err) {
    return next(err);
  }
};

//RESET Password

const resetPassword = async (req, res, next) => {
  try {
    const validatedBody = validateRequest(res, resetPasswordSchema, req.body);
    if (!validatedBody) return;
    const { token, newPassword } = validatedBody;
    const user = await User.findOne({
      password_reset_token: token,
      password_reset_expires_at: { $gt: new Date() },
    }).select("+password_reset_token");

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Expired password reset token or invalid password reset token.",
      });
    }

    user.password_hash = await hashPassword(newPassword);
    user.password_reset_token = undefined;
    user.password_reset_expires_at = undefined;
    await user.save();

    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    const csrfToken = crypto.randomUUID();
    const sessionToken = jwt.sign({ id: user._id, role: user.role, csrfToken }, JWT_SECRET, {
      expiresIn: "14d",
    });

    res.cookie("session_token", sessionToken, getCookieOptions(req, FOURTEEN_DAYS));

    return res.status(StatusCodes.OK).json({
      message: "Password reset successful. You are now signed in.",
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// GET /users/me - lets the SPA hydrate auth state after an OAuth redirect (no JSON body returned by that flow).
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No user is authenticated." });
    }
    return res.status(StatusCodes.OK).json({
      csrfToken: req.user.csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
