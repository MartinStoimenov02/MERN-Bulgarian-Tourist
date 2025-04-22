import express from 'express';
import { createUser, getUser, validateUser, checkUserExists, resetPassword, googleAuth, updatePoints, updateField, deleteAccount, getTopUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/getUser", getUser);
router.post("/validateUser", validateUser);
router.post("/createUser", createUser);
router.post("/checkUserExists", checkUserExists);
router.post("/resetPassword", resetPassword);
router.post("/googleAuth", googleAuth);
router.put("/updatePoints", updatePoints);
router.put("/updateField", updateField);
router.post("/deleteAccount", deleteAccount);
router.get("/getTopUsers", getTopUsers);

export default router;
