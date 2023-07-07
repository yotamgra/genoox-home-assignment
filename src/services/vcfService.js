import fs from "fs";

import { lines, cacheAPICalls } from "./fetchVcf.js";
import { processVarient } from "./processVarient.js";

export const countVarientMap = new Map();

export const parseVCFFile = async (filename, start, end, minDP, limit) => {
  if (lines.length === 0) {
    throw new Error("You should fetch the file first");
  }

  const fileNames = [
    "src/files/father_filtered.vcf",
    "src/files/mother_filtered.vcf",
    "src/files/proband_filtered.vcf",
  ];
  // Initialize variant count map
  countVarientMap.set("father", 0);
  countVarientMap.set("mother", 0);
  countVarientMap.set("proband", 0);

  fileNames.forEach((fileName) => {
    fs.writeFileSync(fileName, "");
  });

  let index = 0;
  for (let line of lines) {
    index++;
    if (
      countVarientMap.get("father") === limit &&
      countVarientMap.get("mother") === limit &&
      countVarientMap.get("proband") === limit
    ) {
      break;
    }
    if (!line) {
      // Skip empty lines
      continue;
    } else if (line.startsWith("##")) {
      // Copy the header lines to each new file
      fileNames.forEach((fileName) => {
        fs.appendFileSync(fileName, line + "\n");
      });
    } else if (line.startsWith("#")) {
      // Process line starting with "#"
      const ColumnKeys = line.split("\t").slice(0, 9).join("\t");

      ///For each file, add the column keys and relevant sample
      fileNames.forEach((fileName) => {
        const sample = fileName.split("_")[0].split("/")[2];

        fs.appendFileSync(fileName, `${ColumnKeys}\t${sample}\n`);
      });
    } else {
      // Process data line

      const fields = line.split("\t");
       processVarient({fileNames,fields,start, end, minDP, limit});
    }
  }
};

