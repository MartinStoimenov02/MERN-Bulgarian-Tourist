import express from 'express';
import { sendVerificationCode, verifyCode } from '../controllers/email.controller.js';

const router = express.Router();

router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);

export default router;
