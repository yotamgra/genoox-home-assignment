import fs from "fs";
import axios from "axios";
import { lines } from "./fetchVcf.js";
import { log } from "console";

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
  const countVarientMap = new Map();
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
      console.log(line, index, "line and index");
      const fields = line.split("\t");
      // Extract the fields from the line
      const [chr, pos, id, ref, alt, qual, filter, infoItems, formatFields] =
        fields;
      console.log(fields, "fields");
      console.log(infoItems, "infoItems");
      if (!infoItems) {
        console.log(index, "index when infoItems is empty");
        for (let i = 0; i < 15; i++) {
          console.log(lines[i].substring(0, 2));
        }
      }
      const infoItemsArr = infoItems.split(";");
      const info = {};
      infoItemsArr.forEach((item) => {
        const [key, value] = item.split("=");

        info[key] = value;
      });

      if (!start || pos >= start) {
        if (!end || pos <= end) {
          if (!minDP || info.DP >= minDP) {
            // Process sample data
            const sampleData = [
              {
                fieldName: "father",
                sample: fields[9],
                fileIndex: 0,
              },
              {
                fieldName: "mother",
                sample: fields[10],
                fileIndex: 1,
              },
              {
                fieldName: "proband",
                sample: fields[11],
                fileIndex: 2,
              },
            ];
            let gene;
            for (let sampleInfo of sampleData) {
              const { fieldName, sample, fileIndex } = sampleInfo;
              const IsSampleContainDigit = /\d/.test(sample);
              if (
                IsSampleContainDigit &&
                countVarientMap.get(fieldName) < limit
              ) {
                gene =
                  gene || (await fetchVariantDetails({ chr, pos, ref, alt }));
                const newInfo = `${fields[7]};GENE=${gene}`;
                fs.appendFileSync(
                  fileNames[fileIndex],
                  `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sample}\n`
                );
                countVarientMap.set(
                  fieldName,
                  countVarientMap.get(fieldName) + 1
                );
              }
            }
          }
        }
      }
    }
  }
};

const fetchVariantDetails = async ({ chr, pos, ref, alt }) => {
  const VariantDetailsURL =
    "https://franklin.genoox.com/api/fetch_variant_details";
  const REFERENCE_VERSION = "hg19";
  const response = await axios({
    method: "post",
    url: VariantDetailsURL,
    data: {
      chr,
      pos,
      ref,
      alt,
      reference_version: REFERENCE_VERSION,
    },
  });
  return response.data.gene;
};
