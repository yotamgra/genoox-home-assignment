import fs from "fs";
import archiver from "archiver";

export const createZipFile = (rootFolder) => {
  const files = [
    `${rootFolder}/father_filtered.vcf`,
    `${rootFolder}/mother_filtered.vcf`,
    `${rootFolder}/proband_filtered.vcf`,
  ];
  const zipFileName = "files.zip";

  return new Promise((resolve, reject) => {
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

    // Resolve the promise when the ZIP file creation is complete
    zipStream.on("close", () => {
      resolve(zipFileName);
    });

    zipStream.on("error", reject);
  });
};

