import express from 'express';
import { createUser, getUser, validateUser, checkUserExists, resetPassword, googleAuth } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/getUser", getUser);
router.post("/validateUser", validateUser); // Нов ендпойнт за проверка
router.post("/createUser", createUser);
router.post("/checkUserExists", checkUserExists);
router.post("/resetPassword", resetPassword);
router.post("/googleAuth", googleAuth);

export default router;
