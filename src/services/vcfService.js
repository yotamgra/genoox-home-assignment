import fs from "fs";
import { createGunzip } from "zlib";
import axios from "axios";

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
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
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
      const ColumnKeys =
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT";

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
            //sample data can be in the 9th - father 10th - mother  11th - proband
            const sampleFather = line.split("\t")[9];
            const sampleMother = line.split("\t")[10];
            const sampleProband = line.split("\t")[11];
            // cut the sample data from the line
            line = line.split("\t").slice(0, 9).join("\t");

            //check if the sample data contains numbers if so it exists else it doesnt
            if (sampleFather.match(/\d+/g)) {
              if (fatherVarientCount < limit) {
                const gene = await fetchVariantDetails({ chr, pos, ref, alt });
                //add gene to info field name GENE and add the gene name
                const newInfo = `${fields[7]};GENE=${gene}`;

                //push the fieldes to the file
                fs.appendFileSync(
                  fileNames[0],
                  `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sampleFather}\n`
                );
                fatherVarientCount++;
              }
            }
            if (sampleMother.match(/\d+/g)) {
              if (motherVarientCount < limit) {
                const gene = await fetchVariantDetails({ chr, pos, ref, alt });
                const newInfo = `${fields[7]};GENE=${gene}`;
                fs.appendFileSync(
                  fileNames[1],
                  `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sampleFather}\n`
                );
                motherVarientCount++;
              }
            }
            if (sampleProband.match(/\d+/g)) {
              if (probandVarientCount < limit) {
                const gene = await fetchVariantDetails({ chr, pos, ref, alt });
                const newInfo = `${fields[7]};GENE=${gene}`;
                fs.appendFileSync(
                  fileNames[2],
                  `${chr}\t${pos}\t${id}\t${ref}\t${alt}\t${qual}\t${filter}\t${newInfo}\t${formatFields}\t${sampleFather}\n`
                );
                probandVarientCount++;
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
