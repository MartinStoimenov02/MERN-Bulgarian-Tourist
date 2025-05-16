import express from 'express';
import { sendVerificationCode, verifyCode, sendNotificationEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);
router.post("/sendNotificationEmail", sendNotificationEmail);

export default router;
