import express from "express";
import { processVcf, test } from "../controllers/vcfController.js";

const router = express.Router();

router.route("/").post(processVcf).get(test);

export default router;
