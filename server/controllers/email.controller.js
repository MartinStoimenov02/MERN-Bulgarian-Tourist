import nodemailer from "nodemailer";
import dotenv from "dotenv";
import UserModel from '../models/user.model.js';
import logError from '../utils/logger.js';

dotenv.config();

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD
    }
});

const verificationCodes = {};

export const sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        verificationCodes[email] = verificationCode;

        console.log("Verification Code:", verificationCode);
        
        const mailOptions = {
            from: SENDER_EMAIL,
            to: email,
            subject: "Your Verification Code",
            html: `<p>Hello,</p><p>Your verification code is: <b>${verificationCode}</b></p><p>This code is valid for 10 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Verification code sent successfully." });
    } catch (err) {
      next(err);
        logError(err, req, { className: 'email.controller', functionName: 'sendVerificationCode', user: id });
        console.error("Error sending email:", err);
        res.status(500).json({ message: "Error sending verification code." });
    }
};

export const verifyCode = async (req, res) => {
    const { email, code } = req.body;
    try {
        if (verificationCodes[email] && verificationCodes[email] == code) {
            delete verificationCodes[email];
            res.status(200).json({ success: true, message: "Code is valid." });
        } else {
            res.status(400).json({ success: false, message: "Invalid code." });
        }
    } catch (err) {
      next(err);
        logError(err, req, { className: 'email.controller', functionName: 'verifyCode', user: email });
        console.error("Error verifying code:", err);
        res.status(500).json({ message: "Error verifying code." });
    }
};

export const sendNotificationEmail = async (req, res) => {
    try {
      const { adminId, userId, notificationMessage } = req.body;

      const admin = await UserModel.findById( adminId );
      
          if(!admin.isAdmin){
            res.status(403).json({
              success: false,
              message: 'Достъп отказан!',
            });
          }

        const user = await UserModel.findById( userId );

        
  
      if (!user.email || !notificationMessage) {
        return res.status(400).json({ message: "Липсват задължителни полета (email, subject, html)." });
      }
  
      const mailOptions = {
        from: SENDER_EMAIL,
        to: user.email,
        subject: "Нова нотификация за "+user.name,
        html: notificationMessage,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: "Notification email sent successfully." });
    } catch (err) {
      next(err);
      logError(err, req, { className: 'email.controller', functionName: 'sendNotificationEmail', user: req.body.email });
      console.error("Error sending notification email:", err);
      res.status(500).json({ message: "Error sending notification email." });
    }
  };
  