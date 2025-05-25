import express from "express";
import { getActiveNationalSites, addNationalSite, addNationalSiteToMyList, getAllNationalSites, deleteNationalSite, updateNationalSite} from "../controllers/nationalSite.controller.js";

const router = express.Router();

router.post("/getActiveNationalSites", getActiveNationalSites);
router.get("/getAllNationalSites", getAllNationalSites);
router.post("/addNationalSite", addNationalSite);
router.post("/addNationalSiteToMyList", addNationalSiteToMyList);
router.delete("/deleteNationalSite", deleteNationalSite);
router.put("/updateNationalSite/:id", updateNationalSite);

export default router;
