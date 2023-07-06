import http from "http";
import axios from "axios";
import zlib from "zlib";
import asyncHandler from "express-async-handler";
import { PassThrough } from "stream";

export const lines = [];

export const fetchVcf = asyncHandler(async (req, res) => {
    try {
      // Fetch the zipped VCF file
      const vcfUrl =
        "https://s3.amazonaws.com/resources.genoox.com/homeAssingment/demo_vcf_multisample.vcf.gz";
      const response = await axios.get(vcfUrl, { responseType: "stream" });
  
      // Create a PassThrough stream
      const ourStream = new PassThrough();
  
      // Pipe the response stream to our PassThrough stream
      response.data.pipe(zlib.createGunzip()).pipe(ourStream);
  
      // Process the data from our PassThrough stream
      let vcfData = "";
      
      ourStream.on("data", (chunk) => {
        const chunkData = chunk.toString();
        vcfData += chunkData;
        // Process the individual lines from the chunk
        const chunkLines = chunkData.split("\n");
        lines.push(...chunkLines);
      });
  
      ourStream.on("end", () => {
        // Processing complete
        console.log("File read successfully");
       
        res.send("File read successfully");
      });
  
      ourStream.on("error", (error) => {
        // Error handling
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
      });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  });