const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { sendVerificationEmail } = require("../utils/sendEmail");
//User is capitalized because it represents a model which is a collection of items for the database
const { User, ArchivedUser } = require("../models/user.js");
const { hashPassword, comparePassword } = require("../utils/password.js");
const { registerSchema, loginSchema } = require("../validation/userValidation");
const JWT_SECRET = process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";

// Client URL for email verification links
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
// Determine if the environment is development or production
const IS_DEV_ENV = process.env.NODE_ENV !== "production";

//we want  sameSite cookies to be lax as per userStory 2.1
const getCookieOptions = (req, maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge,
});

//function register a new user document in MongoDB user story 2.1.6
// POST /api/v1/users/register

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
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email already registered." });
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
      token_version: 0,
      is_deleted: false,
    });
    const verifyUrl = `${CLIENT_URL}/verify?token=${verificationToken}`;
    let emailSent = true;

    // Send verification email to the user
    try {
      await sendVerificationEmail(
        newUser.email,
        "Verify your email address",
        `Hello ${newUser.name || ""},\n\nPlease verify your account by clicking this link: ${verifyUrl}`,
        `<p>Hello ${newUser.name || "User"},</p>
    <p>Please Verify your account by clicking the link below:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link expires in 24 hours.</p>`,
      );
    } catch (error) {
      if (IS_DEV_ENV && EMAIL_FAIL_OPEN) {
        emailSent = false;

        console.warn(
          "Verification email could not be sent:",
          error.code,
          error.message,
        );
      } else {
        try {
          await User.findByIdAndDelete(newUser._id);
        } catch (rollbackError) {
          console.error(
            "Could not remove user after email failed:",
            rollbackError.message,
          );
        }

        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          message:
            "Registration is temporarily unavailable because verification email could not be sent. Please try again shortly.",
        });
      }
    }

    // Return a success response with the new user's details (excluding sensitive information)
    return res.status(StatusCodes.CREATED).json({
      message: emailSent
        ? "Registration successful. Please check for verification email."
        : "Registration successful. Verification email could not be sent. Use the dev verification link below.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tos_agreement: newUser.tos_agreement,
        tos_agreement_at: newUser.tos_agreement_at,
        created_at: newUser.createdAt || newUser.created_at,
      },
      // Include dev verification details in the response if in development environment
      ...(IS_DEV_ENV
        ? {
            devVerification: {
              token: verificationToken,
              verifyUrl,
            },
          }
        : {}),
    });
  } catch (err) {
    return next(err);
  }
};
//POST reaactivate route /api/v1/users/reactivate
const reactivate = async( req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({message: "Email and password are needed."});
    }
    const user = await User.findOne({email});
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({message: "Email or password is incorrect."});
    }
    const isMatch = await comparePassword(password, user.password_hash);
    if(!isMatch){
      return res.status(StatusCodes.UNAUTHORIZED).json({message: "Email or password is incorrect."});
    }
    if (!user.is_deleted) {
      return res.status(StatusCodes.BAD_REQUEST).json({message: "Account is active."});
    }
    //check if request is made within 30 day period to reactivate deleted account
    const monthExpired = 30 * 24 * 3600 * 1000;
    const timeSinceDeletedAcct = user.deleted_at ? Date.now() - new Date(user.deleted_at).getTime() : 0;
    if (timeSinceDeletedAcct > monthExpired) {
      return res.status(StatusCodes.GONE).json({message: "Reactivation period has closed." });
    }
    //Restore user state of not deleted account
    user.is_deleted = false;
    user.deleted_at = null;
    user.token_version = (user.token_version || 0) + 1;
    await user.save();

    //remove ArchivedUser information 
    if(ArchivedUser) {
      await ArchivedUser.deleteOne({original_user_id: user._id });
    }
    return res.status(StatusCodes.OK).json({message: "Account is reactivated. Please log in."});
  }catch (error) {
    return next(error);
  }
}
//user story 2.1.8 - Login
//POST /api/v1/users/login
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
    // Look up in mongo database
    const user = await User.findOne({ email });
    if (!user || user.is_deleted) {
      req.app.emit?.("login_failed", {
        email,
        ip: req.ip,
        reason: user?.is_deleted ? "account_deleted" : "user_not_found",
      });
      
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid email or password." });
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
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid email or password." });
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
    const token = jwt.sign(
      { id: user._id, role: user.role, token_version: user.token_version ?? 0, csrfToken },
      JWT_SECRET,
      { expiresIn: tokenExpiry },
    );
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
//clear cookies from most active session after user logs out so user's cookies cannot be used inappropriately

// POST /api/v1/users/logout

const logout = async (req, res) => {
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  const hasSessionCookie = Boolean(req.cookies?.session_token);
  res.clearCookie("session_token", cookieOptions);

  if (!hasSessionCookie) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user is authenticated.",
    });
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
    });
    if (!user || user.is_deleted) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid or expired verification token." });
    }

    //Email is verified and clear token
    user.email_verified_at = new Date();
    user.verification_token = undefined;
    user.verification_token_expires_at = undefined;
    await user.save();

    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    const csrfToken = crypto.randomUUID();
    const sessionToken = jwt.sign(
      { id: user._id, role: user.role, token_version: user.token_version ?? 0, csrfToken },
      JWT_SECRET,
      { expiresIn: "14d" },
    );

    res.cookie(
      "session_token",
      sessionToken,
      getCookieOptions(req, FOURTEEN_DAYS),
    );

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

// POST /api/v1/users/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Please provide an email address." });
    }
    const user = await User.findOne({ email });
    if (!user || user.is_deleted) {
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

    // Send password reset email to the user
    let emailSent = true;
    try {
      await sendVerificationEmail(
        user.email,
        "Password Reset Request",
        `You requested a password reset. Please click this link: ${resetUrl}`,
        `<p>Hello ${user.name || "User"}, </p>
          <p>Here's your link to reset a new password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Reset link will expire in 1 hour.</p>`,
      );
    } catch (error) {
      // If email sending fails, handle it based on the environment and EMAIL_FAIL_OPEN setting
      if (IS_DEV_ENV && EMAIL_FAIL_OPEN) {
        emailSent = false;
        console.warn(
          "Password reset email could not be sent:",
          error.code,
          error.message,
        );
      } else {
        user.password_reset_token = undefined;
        user.password_reset_expires_at = undefined;

        await user.save();

        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          message:
            "Password reset is temporarily unavailable because email could not be sent. Please try again shortly.",
        });
      }
    }
    return res.status(StatusCodes.OK).json({
      message: emailSent
        ? "If an account with the email exists, a password reset link will be provided to that email."
        : "Password reset email could not be sent. Use the dev reset link below.",
      ...(IS_DEV_ENV
        ? {
            devPasswordReset: {
              token: resetToken,
              resetUrl,
            },
          }
        : {}),
    });
  } catch (err) {
    return next(err);
  }
};

//RESET Password 
//POST /api/v1/users/reset-password

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Token and new password are needed." });
    }
    const user = await User.findOne({
      password_reset_token: token,
      password_reset_expires_at: { $gt: new Date() },
    });

    if (!user || user.is_deleted) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Expired password reset token or invalid password reset token.",
      });
    }

    user.password_hash = await hashPassword(newPassword);
    user.password_reset_token = undefined;
    user.password_reset_expires_at = undefined;

    user.token_version = (user.token_version || 0) + 1;
    await user.save();

    const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
    const csrfToken = crypto.randomUUID();
    const sessionToken = jwt.sign(
      { id: user._id, role: user.role, token_version: user.token_version, csrfToken },
      JWT_SECRET,
      { expiresIn: "14d" },
    );

    res.cookie(
      "session_token",
      sessionToken,
      getCookieOptions(req, FOURTEEN_DAYS),
    );

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

module.exports = {
  register,
  reactivate,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
