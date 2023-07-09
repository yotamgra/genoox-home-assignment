import fs from "fs";
import asyncHandler from "express-async-handler";
import { parseVCFFile } from "../services/vcfService.js";
import { createZipFile } from "../services/createZipFile.js";
import { convertFileToText } from "../services/download&convert.js";

export const processVcf = asyncHandler(async (req, res) => {
  const { start, end, minDP, limit } = req.body;

  if (!limit) {
    res.status(400);
    throw new Error("Limit is required");
  }
  if (limit >= 10) {
    res.status(400);
    throw new Error("Limit must be less than 10");
  }
  //time to process the file
  const startTimer = Date.now();
  await parseVCFFile("src/sevices/output.vcf", start, end, minDP, limit);
  const endTimer = Date.now();
  const timeTaken = endTimer - startTimer;
  console.log("Time taken to process the file: ", timeTaken);
  
  const rootFolder = "src/files";
  const zipFilePath = await createZipFile(rootFolder);

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=filtered_files.zip"
  );
  res.setHeader("Content-Type", "application/zip");

  res.sendFile(zipFilePath, { root: rootFolder }, (err) => {
    if (err) {
      console.error("Error sending the ZIP file:", err);
      throw new Error("Error sending the ZIP file:", err);
    } else {
      console.log("ZIP file sent successfully.");
      fs.unlinkSync(`${rootFolder}/${zipFilePath}`); // Clean up the temporary ZIP file
    }
  });
});

export const downloadAndConvert = asyncHandler(async (req, res) => {
  await convertFileToText();
  res
    .status(200)
    .json({ message: "File downloaded and converted to text successfully." });
});
