import fs from "fs";
import axios from "axios";
import { countVarientMap } from "./vcfService.js";
import { cacheAPICalls } from "./fetchVcf.js";

export const processVarient = async ({
  sampleEntries,
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

  if (
    (!start || pos >= start) &&
    (!end || pos <= end) &&
    (!minDP || info.DP >= minDP)
  ) {
    // Process sample data
    const sampleData = sampleEntries.map((sample) => ({
      ...sample,
      sampleValue: fields[sample.sampleIndex],
    }));

    let gene;
    for (let sample of sampleData) {
      const { sampleName, fileName, sampleValue } = sample;
      const IsSampleContainDigit = /\d/.test(sampleValue);

      if (IsSampleContainDigit && countVarientMap.get(sampleName) < limit) {
        gene =
          gene ||
          cacheAPICalls.get(`${chr}:${pos}:${ref}:${alt}`) ||
          (await fetchVariantDetails({ chr, pos, ref, alt }));
        const newInfo = `${fields[7]};GENE=${gene}`;
        fs.appendFileSync(
          fileName,
          `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sampleValue}\n`
        );
        countVarientMap.set(sampleName, countVarientMap.get(sampleName) + 1);
      }
    }
  }
};

const fetchVariantDetails = async ({ chr, pos, ref, alt }) => {
  const VariantDetailsURL = process.env.VARIANT_DETAILS_URL;
    
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
