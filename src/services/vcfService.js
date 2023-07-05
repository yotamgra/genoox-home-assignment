import fs from "fs";
import { createGunzip } from "zlib";
import axios from "axios";
import { log } from "console";

export const parseVCFFile = async (filename, start, end, minDP, limit) => {
  // Create the three new files: father_filtered.vcf, mother_filtered.vcf, proband_filtered.vcf
  const fileNames = [
    "src/files/father_filtered.vcf",
    "src/files/mother_filtered.vcf",
    "src/files/proband_filtered.vcf",
  ];
  let fatherVarientCount = 0;
  let motherVarientCount = 0;
  let probandVarientCount = 0;

  fileNames.forEach((fileName) => {
    fs.writeFileSync(fileName, "");
  });

  // Read the VCF file
  const vcfData = fs.readFileSync("src/downloads/output.vcf", "utf8");

  // Split the file into individual lines
  const lines = vcfData.split("\n");

  // Process each line of the VCF file
  for (let line of lines) {
    if (
      fatherVarientCount === limit &&
      motherVarientCount === limit &&
      probandVarientCount === limit
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
      const chr = fields[0];
      const pos = parseInt(fields[1]);
      const id = fields[2];
      const ref = fields[3];
      const alt = fields[4];
      const qual = fields[5];
      const filter = fields[6];
      const infoItems = fields[7].split(";");
      const info = {};
      infoItems.forEach((item) => {
        const [key, value] = item.split("=");
        info[key] = value;
      });
      const formatFields = fields[8];

      if (start && pos >= start) {
        if (end && pos <= end) {
          if (minDP && info.DP >= minDP) {
            // Process sample data
            const sampleData = [
              {
                fieldName: "father",
                sample: fields[9],
                count: fatherVarientCount,
                fileIndex: 0,
              },
              {
                fieldName: "mother",
                sample: fields[10],
                count: motherVarientCount,
                fileIndex: 1,
              },
              {
                fieldName: "proband",
                sample: fields[11],
                count: probandVarientCount,
                fileIndex: 2,
              },
            ];

            for (let sampleInfo of sampleData) {
              const { fieldName, sample, count, fileIndex } = sampleInfo;
              if (sample.match(/\d+/g) && count < limit) {
                const gene = await fetchVariantDetails({ chr, pos, ref, alt });
                const newInfo = `${fields[7]};GENE=${gene}`;
                fs.appendFileSync(
                  fileNames[fileIndex],
                  `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sample}\n`
                );
                sampleInfo.count++;
              }
            }
          }
        }
      }
    }
  }

  return "success";
};

const fetchVariantDetails = async ({ chr, pos, ref, alt }) => {
  const VariantDetailsURL =
    "https://franklin.genoox.com/api/fetch_variant_details";
  const response = await axios({
    method: "post",
    url: VariantDetailsURL,
    data: {
      chr: chr,
      pos: pos,
      ref: ref,
      alt: alt,
      reference_version: "hg19",
    },
  });
  return response.data.gene;
};
