import fs from "fs";
import axios from "axios";
import zlib from "zlib";
import asyncHandler from "express-async-handler";
import { PassThrough } from "stream";

export let lines = [];
export const cacheAPICalls = new Map();

export const fetchVcf = asyncHandler(async (req, res) => {
  // Fetch the zipped VCF file
  const vcfUrl =
    "https://s3.amazonaws.com/resources.genoox.com/homeAssingment/demo_vcf_multisample.vcf.gz";
  const response = await axios.get(vcfUrl, { responseType: "stream" });

  // Create a PassThrough stream
  const ourStream = new PassThrough();

  const gunzip = zlib.createGunzip();

  // Pipe the response stream to our PassThrough stream
  response.data.pipe(gunzip).pipe(ourStream);

  // Process the data from our PassThrough stream
  let vcfData = "";

  ourStream.on("data", function (chunk) {
    vcfData += chunk.toString("utf8");
  });

  ourStream.on("end", () => {
    lines = vcfData.split("\n");
    // Processing complete
    console.log("File read successfully");

    res.send("File read successfully");
  });
});

export const readDownloadedVcf = asyncHandler(async (req, res) => {
  const vcfFile = "src/downloads/output.vcf";
  const fileStream = fs.createReadStream(vcfFile, "utf-8");
  let vcfData = "";

  fileStream.on("data", (data) => {
    vcfData += data;
  });
  fileStream.on("end", () => {
    lines = vcfData.split("\n");
    console.log("File read successfully");
    res.send("File read successfully");
  });
});
