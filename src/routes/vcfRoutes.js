import express from "express";
import { processVcf } from "../controllers/vcfController.js";
import { downloadAndConvert } from "../controllers/vcfController.js";
import { streamingVcf } from "../services/streamingVcf.js";
import { lines } from "../services/streamingVcf.js";

const router = express.Router();

router.route("/").post(processVcf);
router.route("/test").get((req, res) => {
    console.log(lines);
  res.send("test");
});
router.route("/streaming").get(streamingVcf);
router.route("/download").get(downloadAndConvert);
export default router;
