const express = require("express");

const vcfController = require("../controllers/vcfController");

const router = express.Router();

router.route("/").post(vcfController.processVcf).get(vcfController.test);

module.exports = router;
