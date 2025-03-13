import express from "express";
import { getActiveNationalSites, addNationalSite, addNationalSiteToMyList } from "../controllers/nationalSite.controller.js";

const router = express.Router();

router.get("/getActiveNationalSites", getActiveNationalSites);
router.post("/addNationalSite", addNationalSite);
router.post("/addNationalSiteToMyList", addNationalSiteToMyList);

export default router;
