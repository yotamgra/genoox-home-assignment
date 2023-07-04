const fs = require('fs');

function parseVCFFile(filename) {
  const variants = [];
  const fileData = fs.readFileSync(filename, 'utf8');
  const lines = fileData.split('\n');

  let headers = [];
  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith('##')) {
      // Skip header lines
      return;
    } else if (line.startsWith('#')) {
      // Parse column headers
      headers = line.split('\t');
      headers[0] = headers[0].substring(1);
      console.log(headers)
      return;
    }

    const fields = line.split('\t');
    const chrom = fields[0];
    const pos = parseInt(fields[1]);
    const ref = fields[3];
    const alt = fields[4];
    const infoItems = fields[7].split(';');
    const info = {};
    infoItems.forEach((item) => {
      const [key, value] = item.split('=');
      info[key] = value;
    });
    const formatFields = fields[8].split(':');
    const samples = fields.slice(9);

    const variant = {
      chromosome: chrom,
      position: pos,
      refAllele: ref,
      altAllele: alt,
      info,
      formatFields,
      samples: [],
    };

    samples.forEach((sample, i) => {
      const sampleFields = sample.split(':');
      const sampleData = {};
      formatFields.forEach((field, j) => {
        sampleData[field] = sampleFields[j];
      });
      variant.samples.push({
        sampleId: headers[i],
        data: sampleData,
      });
    });

    variants.push(variant);
  });

  return variants;
}

// Usage example
const filename = 'output.vcf';
const variants = parseVCFFile(filename);

// Accessing variant information
variants.forEach((variant) => {
  console.log(`Chromosome: ${variant.chromosome}`);
  console.log(`Position: ${variant.position}`);
  console.log(`Ref Allele: ${variant.refAllele}`);
  console.log(`Alt Allele: ${variant.altAllele}`);
  console.log('INFO:', variant.info);
  console.log('Format Fields:', variant.formatFields);
  console.log('Samples:');
  variant.samples.forEach((sample) => {
    console.log(`- Sample ID: ${sample.sampleId}`);
    console.log('  Data:', sample.data);
  });
  console.log('---');
});