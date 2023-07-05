const fs = require("fs");
const archiver = require("archiver");

const asyncHandler = require("async-handler");
const vcfService = require("../services/vcfService");
const createZipFile = require("../services/createZipFile");

// const processVcf = asyncHandler(async (req, res) => {
//   res.json(req.body);
// });
const processVcf = async (req, res) => {
  const { start, end, minDP, limit } = req.body;
  await vcfService.parseVCFFile(
    "src/sevices/output.vcf",
    start,
    end,
    minDP,
    limit
  );
  try {
    const rootFolder = "src/files";
    const zipFilePath = await createZipFile(rootFolder);

    // Set the appropriate headers for the file download
    res.setHeader("Content-Disposition", "attachment; filename=files.zip");
    res.setHeader("Content-Type", "application/zip");

    // Send the ZIP file as the response
    res.sendFile(zipFilePath, { root: rootFolder }, (err) => {
      if (err) {
        console.error("Error sending the ZIP file:", err);
      } else {
        console.log("ZIP file sent successfully.");
        // Clean up the temporary ZIP file
        fs.unlinkSync(zipFilePath);
      }
    });
  } catch (error) {
    console.error("Error creating the ZIP file:", error);
    // Handle the error and send an appropriate response
  }
};
const test = asyncHandler(async (req, res) => {
  console.log("first");
  res.send("test");
});

module.exports = {
  processVcf,
  test,
};
