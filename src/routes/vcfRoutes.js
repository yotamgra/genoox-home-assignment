import express from "express";
import { processVcf, test } from "../controllers/vcfController.js";
import { convertFileToText } from "../services/download&convert.js";

const router = express.Router();

router.route("/").post(processVcf).get(test);
router.route("/download").get(convertFileToText);

export default router;
