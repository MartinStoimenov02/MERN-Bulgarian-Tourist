import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: SENDER_EMAIL,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    next(err);
    logError(err, null, { className: 'email', functionName: 'sendEmail'});
    console.error("Error sending email:", err);
    throw err;
  }
};
