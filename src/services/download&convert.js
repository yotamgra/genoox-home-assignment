import axios from "axios";
import fs from "fs";
import { createGunzip } from "zlib";

const url =
  "https://s3.amazonaws.com/resources.genoox.com/homeAssingment/demo_vcf_multisample.vcf.gz";
const downloadFolderPath = "src/downloads/";
const gzippedFile = downloadFolderPath + "output.vcf.gz";
const outputFile = downloadFolderPath + "output.vcf";

export const downloadFile = async () => {
  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    const fileStream = fs.createWriteStream(gzippedFile);
    response.data.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });
  } catch (error) {
    throw new Error("Error downloading the file:", error);
  }
};

export async function convertFileToText() {
  try {
    await downloadFile();
    const gunzipPromise = new Promise((resolve, reject) => {
      const gunzip = createGunzip();
      const inputStream = fs.createReadStream(gzippedFile);
      const outputStream = fs.createWriteStream(outputFile);
      
      inputStream.pipe(gunzip).pipe(outputStream);

      inputStream.on("end", resolve);
      gunzip.on("error", reject);
      outputStream.on("error", reject);
    });

    await gunzipPromise;

    console.log("File converted to text successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

convertFileToText();
