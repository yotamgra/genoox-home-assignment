import fs from "fs";
import { createGunzip } from "zlib";

export const parseVCFFile = (filename, start, end, minDP, limit) => {
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
      const chrom = fields[0];
      const pos = parseInt(fields[1]);
      const ref = fields[3];
      const alt = fields[4];
      const infoItems = fields[7].split(";");
      const info = {};
      infoItems.forEach((item) => {
        const [key, value] = item.split("=");
        info[key] = value;
      });
      const formatFields = fields[8].split(":");

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
                //push the fieldes in index 0-8 and add the sample data in index 9
                fs.appendFileSync(fileNames[0], `${line}\t${sampleFather}\n`);
                fatherVarientCount++;
              }
            }
            if (sampleMother.match(/\d+/g)) {
              if (motherVarientCount < limit) {
                fs.appendFileSync(fileNames[1], `${line}\t${sampleMother}\n`);
                motherVarientCount++;
              }
            }
            if (sampleProband.match(/\d+/g)) {
              if (probandVarientCount < limit) {
                fs.appendFileSync(fileNames[2], `${line}\t${sampleProband}\n`);
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
