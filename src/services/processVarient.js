import fs from "fs";
import axios from "axios";
import { countVarientMap } from "./vcfService.js";
import { cacheAPICalls } from "./fetchVcf.js";

export const processVarient = async ({
  samplesEntries,
  fields,
  start,
  end,
  minDP,
  limit,
  deNovo,
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
    let samplesData = {};
    samplesEntries.forEach((sample) => {
      samplesData[sample.name] = {
        ...sample,
        value: fields[sample.index],
      };
    });

    let gene;

    for (let sampleKey in samplesData) {
      const sample = samplesData[sampleKey];
      const IsSampleContainDigit = /\d/.test(sample.value);

      const sampleCount = countVarientMap.get(sample.name);

      if (IsSampleContainDigit && sampleCount < limit) {
        gene = gene || (await getGeneFromCacheOrAPI({ chr, pos, ref, alt }));
        const newInfo = `${infoItems};GENE=${gene}`;
        const variant = `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sample.value}\n`;
        samplesData[sampleKey].variant = variant;
      }
    }

    for (let sampleKey in samplesData) {
      const sample = samplesData[sampleKey];
      const sampleCount = countVarientMap.get(sample.name);
      if (sampleKey === "proband") {
        if (deNovo) {
          if (
            !samplesData["father"].variant &&
            !samplesData["mother"].variant
          ) {
            //do nothing
          }
        } else if (deNovo === false) {
          if (samplesData["father"].variant || samplesData["mother"].variant)
            appendVariantToSampleFile({ sample, sampleCount });
        } else {
          if (deNovo === undefined || deNovo === null);
          appendVariantToSampleFile({ sample, sampleCount });
        }
      } else {
        // father or mother
        if (samplesData[sampleKey].variant) {
          appendVariantToSampleFile({ sample, sampleCount });
        }
      }
    }
  }
};

const appendVariantToSampleFile = ({ sample, sampleCount }) => {
  fs.appendFileSync(sample.fileName, sample.variant);
  countVarientMap.set(sample.name, sampleCount + 1);
};

const getGeneFromCacheOrAPI = async ({ chr, pos, ref, alt }) => {
  const gene =
    cacheAPICalls.get(`${chr}:${pos}:${ref}:${alt}`) ||
    (await fetchVariantDetails({ chr, pos, ref, alt }));
  return gene;
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
