const fs = require("fs");
const { createGunzip } = require("zlib");

async function parseVCFFile(filename, start, end, minDP, limit) {
  // Create the three new files: father_filtered.vcf, mother_filtered.vcf, proband_filtered.vcf
const fileNames = ['father_filtered.vcf', 'mother_filtered.vcf', 'proband_filtered.vcf'];
fileNames.forEach(fileName => {
  fs.writeFileSync(fileName, '');
});

// Read the VCF file
const vcfData = fs.readFileSync('C:/Users/yotam/genoox-home-assignment/services/output.vcf', 'utf8');

// Split the file into individual lines
const lines = vcfData.split('\n');

// Initialize an empty array to store the processed data
const processedData = [];

// Process each line of the VCF file
lines.forEach(line => {
  if (line.startsWith('##')) {
    // Copy the header lines to each new file
    fileNames.forEach(fileName => {
      fs.appendFileSync(fileName, line + '\n');
    });
  } else if (line.startsWith('#')) {
    
    // Process header line starting with "#"
    const headerFields = line.split('\t');
    const sampleIndex = headerFields.indexOf('proband'); // Change 'proband' to the relevant sample name ('father', 'mother', etc.)
    const relevantHeader = ['#' + headerFields.slice(0, 9).join('\t'), headerFields[sampleIndex]].join('\t');
    console.log("headerFields",headerFields)
    console.log("sampleIndex",sampleIndex)
    console.log("relevantHeader",relevantHeader)
    // Add the relevant header line to the processed data array
    processedData.push({ fileName: `${headerFields[sampleIndex].toLowerCase()}_filtered.vcf`, lines: [relevantHeader] });
  } else {
    // Process data line
    const sampleData = line.split('\t')[9]; // Assuming sample data is always in the 10th column
    const relevantLine = ['#' + line.split('\t').slice(0, 9).join('\t'), sampleData].join('\t');

    // Add the relevant line to the corresponding processed data array
    const relevantData = processedData.find(data => data.fileName === `${sampleData.toLowerCase()}_filtered.vcf`);
    if (relevantData) {
      relevantData.lines.push(relevantLine);
    }
  }
});

// Write the first 10 lines after the header line to each file
processedData.forEach(data => {
  const { fileName, lines } = data;
  fs.appendFileSync(fileName, lines.slice(0, 11).join('\n'));
});
}

module.exports = {
  parseVCFFile,
};
