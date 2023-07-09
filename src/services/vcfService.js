import fs from "fs";
import { lines } from "./fetchVcf.js";
import { processVarient } from "./processVarient.js";

export const countVarientMap = new Map();

export const parseVCFFile = async ({ start, end, minDP, limit,  deNovo}) => {
  if (lines.length === 0) {
    throw new Error("You should fetch the file first");
  }
  const samplesEntries = createFilferedFiles();

  // Initialize variant count map
  samplesEntries.forEach((sample) => {
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
      samplesEntries.forEach((sample) => {
        fs.appendFileSync(sample.fileName, line + "\n");
      });
    } else if (line.startsWith("#")) {
      // Process line starting with "#"
      const ColumnKeys = line.split("\t").slice(0, 9).join("\t");
     
      ///For each file, add the column keys and relevant sample
      samplesEntries.forEach((sample) => {
        fs.appendFileSync(
          sample.fileName,
          `${ColumnKeys}\t${sample.name}\n`
        );
      });
    } else {
      // Process data line
      const fields = line.split("\t");

      const processVarientArgs = {
        samplesEntries,
        fields,
        start,
        end,
        minDP,
        limit,
        deNovo
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
      const samplesEntries = samples.map((sample, index) => {
        return {
          name: sample,
          index: index + 9,
          fileName: `${path}/${sample}_filtered.vcf`,
        };
      });

      samplesEntries.forEach((sample) => {
        fs.writeFileSync(sample.fileName, "");
      });

      return samplesEntries;
    }
  }
};
