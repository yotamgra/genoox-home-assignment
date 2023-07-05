const fs = require("fs");
const archiver = require("archiver");

const asyncHandler = require("async-handler");
const vcfService = require("../services/vcfService");

// const processVcf = asyncHandler(async (req, res) => {
//   res.json(req.body);
// });
const processVcf = async (req, res) => {
  const { start, end, minDP, limit } = req.body;
  // await vcfService.parseVCFFile(
  //   "src/sevices/output.vcf",
  //   start,
  //   end,
  //   minDP,
  //   limit
  // );
  const rootFolder = "src/files";

  const files = [
    `${rootFolder}/father_filtered.vcf`,
    `${rootFolder}/mother_filtered.vcf`,
    `${rootFolder}/proband_filtered.vcf`,
  ];

  const zipFileName = "files.zip";

  // Create a writable stream to store the ZIP file
  const zipStream = fs.createWriteStream(zipFileName);

  // Create a new ZIP archive
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Set compression level (optional)
  });

  // Pipe the archive to the zipStream
  archive.pipe(zipStream);

  // Add files to the archive
  files.forEach((filePath) => {
    const fileName = filePath.split("/").pop(); // Extract the filename from the path
    archive.file(filePath, { name: fileName });
  });

  // Finalize the archive and close the write stream
  archive.finalize();

  // Set the appropriate headers for the file download
  res.setHeader("Content-Disposition", "attachment; filename=files.zip");
  res.setHeader("Content-Type", "application/zip");

  // Send the ZIP file as the response
  res.sendFile(zipFileName, { root: rootFolder }, (err) => {
    if (err) {
      console.error("Error sending the ZIP file:", err);
    } else {
      console.log("ZIP file sent successfully.");
      // Clean up the temporary ZIP file
      fs.unlinkSync(zipFileName);
    }
  });
};
const test = asyncHandler(async (req, res) => {
  console.log("first");
  res.send("test");
});

module.exports = {
  processVcf,
  test,
};
