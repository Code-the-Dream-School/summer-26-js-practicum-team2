const Joi = require("joi");

//Register Schema (requires name)
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(30).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 2 characters long.",
    "string.max": "Name cannot be longer than 30 characters.",
    "any.required": "Name is required.",
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .trim()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)
    .required()
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must be at least 8 characters long and include upper and lower case letters, a number, and a special character.",
      "any.required": "Password is required.",
    }),
  confirmPassword: Joi.string()
    .trim()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "string.empty": "Please confirm password.",
      "any.only": "Passwords do not match.",
      "any.required": "Please confirm password.",
    }),
  tos: Joi.boolean().valid(true).required().messages({
    "any.only": "Please accept the terms of service.",
    "any.required": "Please accept the terms of service.",
  }),
});
const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
  // new for front end requirement of remember me
  remember: Joi.boolean().optional().default(false),
});

module.exports = { registerSchema, loginSchema };
