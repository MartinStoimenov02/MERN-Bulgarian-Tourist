import express from "express";
import { getRandomImage, getDistance } from "../controllers/google.controller.js";

const router = express.Router();

router.get("/random-image", getRandomImage);
// router.post("/place-details", getPlaceDetails);
router.post("/place-distance", getDistance);
// router.post("/gemini", gemini);

export default router;
