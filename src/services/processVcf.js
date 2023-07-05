const fs = require("fs");

// Create the three new files: father_filtered.vcf, mother_filtered.vcf, proband_filtered.vcf
const fileNames = [
  "father_filtered.vcf",
  "mother_filtered.vcf",
  "proband_filtered.vcf",
];
fileNames.forEach((fileName) => {
  fs.writeFileSync(fileName, "");
});

// Read the VCF file
const vcfData = fs.readFileSync(
  "src/services/output.vcf",
  "utf8"
);

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

    const ColumnKeys = "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT";

    ///here i want to add for each file this line
    fileNames.forEach((fileName) => {
      const sample = fileName.split("_")[0];
      fs.appendFileSync(fileName, `${ColumnKeys}\t${sample}`);
    });
  } else {
    // Process data line
    //
    console.log(line.split("\t"));
    const sampleData = line.split("\t")[9]; // Assuming sample data is always in the 10th column
    ///sample data can be in the 9th - father 10th - mother  11th - proband
    ///

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

console.log("Filtered VCF files created.");
