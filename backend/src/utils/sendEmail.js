const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const sendVerificationEmail = async (to, subject, text, html) => {
  try {
    const mailChoices = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
      html,
    };
    //Send eamil with transporter
    const info = await transporter.sendMail(mailChoices);
    return info;
  } catch (err) {
    console.error("FAILED TO SEND EMAIL:", err);
    throw err;
  }
};
module.exports = { sendVerificationEmail };
