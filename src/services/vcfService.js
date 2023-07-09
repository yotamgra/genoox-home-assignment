import fs from "fs";
import { lines } from "./fetchVcf.js";
import { processVarient } from "./processVarient.js";

export const countVarientMap = new Map();

export const parseVCFFile = async (filename, start, end, minDP, limit) => {
  if (lines.length === 0) {
    throw new Error("You should fetch the file first");
  }
  const sampleEntries = createFilferedFiles();

  // Initialize variant count map
  sampleEntries.forEach((sample) => {
    countVarientMap.set(sample.sampleName, 0);
  });

  for (let line of lines) {
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
      sampleEntries.forEach((sample) => {
        fs.appendFileSync(sample.fileName, line + "\n");
      });
    } else if (line.startsWith("#")) {
      // Process line starting with "#"
      const ColumnKeys = line.split("\t").slice(0, 9).join("\t");
      const fields = line.split("\t");
      // sample can be in any order in index 9,10,11

      ///For each file, add the column keys and relevant sample
      sampleEntries.forEach((sample) => {
        fs.appendFileSync(
          sample.fileName,
          `${ColumnKeys}\t${sample.sampleName}\n`
        );
      });
    } else {
      // Process data line
      const fields = line.split("\t");

      const processVarientArgs = {
        sampleEntries,
        fields,
        start,
        end,
        minDP,
        limit,
      };

      if (!end) {
        await processVarient(processVarientArgs);
      } else {
        processVarient(processVarientArgs);
      }
    }
  }
};

const createFilferedFiles = () => {
  for (let line of lines) {
    if (!line) {
      // Skip empty lines
      continue;
    }
    if (line.startsWith("##")) {
      continue;
    }
    if (line.startsWith("#")) {
      // Process line starting with "#"
      const ColumnKeys = line.split("\t").slice(0, 9).join("\t");
      const fields = line.split("\t");
      // sample can be in any order in index 9,10,11
      const samples = fields.slice(9, 12);

      const path = "src/files";
      const sampleEntries = samples.map((sample, index) => {
        return {
          sampleName: sample,
          sampleIndex: index + 9,
          fileName: `${path}/${sample}_filtered.vcf`,
        };
      });

      sampleEntries.forEach((sample) => {
        fs.writeFileSync(sample.fileName, "");
      });

      return sampleEntries;
    }
  }
};
