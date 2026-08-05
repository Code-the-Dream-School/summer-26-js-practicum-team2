const nodemailer = require("nodemailer");

// Logs the email to the console if SMTP is unavailable or if EMAIL_FAIL_OPEN is set to true or if not in production.
const shouldUseFailOpen =
  process.env.EMAIL_FAIL_OPEN === "true" ||
  process.env.NODE_ENV !== "production";

// Helper function to build the SMTP transporter using environment variables.
const buildSmtpTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Logs the email to the console if SMTP is unavailable or if EMAIL_FAIL_OPEN is set to true or if not in production.
const logFallbackEmail = (mailChoices, err) => {
  console.warn(
    "SMTP unavailable, using dev email fallback. Set SMTP_* vars for real delivery.",
    {
      code: err?.code,
      message: err?.message,
    },
  );
  // Log the email details to the console for development purposes.
  console.info("DEV EMAIL (NOT SENT):", {
    from: mailChoices.from,
    to: mailChoices.to,
    subject: mailChoices.subject,
    text: mailChoices.text,
  });

  return {
    messageId: "dev-fallback",
    accepted: [mailChoices.to],
    rejected: [],
  };
};

// Sends a verification email using the SMTP transporter.
const sendVerificationEmail = async (to, subject, text, html) => {
  const mailChoices = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    const transporter = buildSmtpTransporter();
    const info = await transporter.sendMail(mailChoices);
    return info;
  } catch (err) {
    // If sending the email fails, check if we should use the fail-open behavior.
    if (shouldUseFailOpen) {
      return logFallbackEmail(mailChoices, err);
    }
    // If not, throw the error to be handled by the caller.
    console.error("FAILED TO SEND EMAIL:", err);
    throw err;
  }
};

module.exports = { sendVerificationEmail };
