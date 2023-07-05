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

  // Initialize an empty array to store the processed data
  ///i dont want this array
  const processedData = [];

  // Process each line of the VCF file

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    //if fatherVarientCount && motherVarientCount && probandVarientCount are all equal to limit then stop the loop
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
      // Process header line starting with "#"

      const ColumnKeys =
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT";

      ///Add the column keys - tle line wich starts with # with the relevant sample
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
      // console.log("fields", fields);
      // console.log("chrom", chrom);
      // console.log("pos", pos);
      // console.log("ref", ref);
      // console.log("alt", alt);
      // console.log("infoItems", infoItems);

      //start,end, minDP are optional
      //limit is the number of max varients for each file
      if (start && pos >= start) {
        if (end && pos <= end) {
          if (minDP && info.DP >= minDP) {
            //sample data can be in the 9th - father 10th - mother  11th - proband
            const sampleFather = line.split("\t")[9];
            const sampleMother = line.split("\t")[10];
            const sampleProband = line.split("\t")[11];
            // cut the sample data from the line
            line = line.split("\t").slice(0, 9).join("\t");
            //should be seen something like: 0/1:7,2:0.222:9:63:63,0,288:0,7,2,0 if exsit or something like: ./.:.:.:.:.:.:. if not
            //so check if the sample contains numbers if so it exists else it doesnt
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
  // i want to return a success message
  return "success";
};


