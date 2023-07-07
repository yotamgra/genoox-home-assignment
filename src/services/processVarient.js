import fs from "fs";
import axios from "axios";
import { countVarientMap } from "./vcfService.js";
import { cacheAPICalls } from "./fetchVcf.js";

export const processVarient = async ({
  fileNames,
  fields,
  start,
  end,
  minDP,
  limit,
}) => {
  // Extract the fields from the line
  const [chr, pos, id, ref, alt, qual, filter, infoItems, formatFields] =
    fields;

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
          if (IsSampleContainDigit && countVarientMap.get(fieldName) < limit) {
            gene =
              gene ||
              cacheAPICalls.get(`${chr}:${pos}:${ref}:${alt}`) ||
              (await fetchVariantDetails({ chr, pos, ref, alt }));
            const newInfo = `${fields[7]};GENE=${gene}`;
            fs.appendFileSync(
              fileNames[fileIndex],
              `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sample}\n`
            );
            countVarientMap.set(fieldName, countVarientMap.get(fieldName) + 1);
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
  cacheAPICalls.set(`${chr}:${pos}:${ref}:${alt}`, response.data.gene);
  return response.data.gene;
};
