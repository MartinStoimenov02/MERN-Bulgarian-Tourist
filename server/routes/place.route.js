import express from "express";
import { getUserPlaces, getPlaceById, addPlace, deletePlace, updateFavourite, visitPlace, updatePlace } from "../controllers/place.controller.js";

const router = express.Router();

router.get("/getUserPlaces", getUserPlaces);
router.get("/getPlaceById", getPlaceById);
router.post("/addPlace", addPlace);
router.delete("/deletePlace", deletePlace);
router.put("/updateFavourite", updateFavourite);
router.put("/visitPlace", visitPlace);
router.put('/updatePlace/:id', updatePlace);

export default router;
