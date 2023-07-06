import express from "express";
import { processVcf } from "../controllers/vcfController.js";
import { downloadAndConvert } from "../controllers/vcfController.js";

const router = express.Router();

router.route("/").post(processVcf)
router.route("/download").get(downloadAndConvert);

export default router;
