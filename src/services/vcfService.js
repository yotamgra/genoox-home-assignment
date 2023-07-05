const fs = require("fs");
const { createGunzip } = require("zlib");

async function parseVCFFile(filename, start, end, minDP, limit) {
  // Create the three new files: father_filtered.vcf, mother_filtered.vcf, proband_filtered.vcf
  const fileNames = [
    "src/files/father_filtered.vcf",
    "src/files/mother_filtered.vcf",
    "src/files/proband_filtered.vcf",
  ];
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
  lines.forEach((line) => {
    
    if (line.startsWith("##")) {
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
        const sample = fileName.split("_")[0];
        fs.appendFileSync(fileName, `${ColumnKeys}\t${sample}`);
      });
    } else {
      // Process data line
      console.log("line", line.split("\t"));
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
      console.log("fields",fields)
      console.log("chrom", chrom)
      console.log("pos", pos)
      console.log("ref", ref)
      console.log("alt", alt)
      console.log("infoItems", infoItems)

      //sample data can be in the 9th - father 10th - mother  11th - proband
      const sampleFather = line.split("\t")[9];
      const sampleMother = line.split("\t")[10];
      const sampleProband = line.split("\t")[11];
      const relevantLine = `${sampleFather}\t${sampleMother}\t${sampleProband}`;

      // Add the relevant line to the corresponding processed data array
      const relevantData = processedData.find(
        (data) => data.fileName === "proband_filtered.vcf"
      );
      if (relevantData) {
        relevantData.lines.push(relevantLine);
      }
    }
  });

  // Write the first 10 lines after the header line to each file
  processedData.forEach((data) => {
    const { fileName, lines } = data;
    fs.appendFileSync(fileName, lines.slice(0, 11).join("\n"));
  });
}

module.exports = {
  parseVCFFile,
};
