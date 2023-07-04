const fs = require("fs");
const { createGunzip } = require("zlib");

async function parseVCFFile(filename, start, end, minDP, limit) {
  const fileStream = fs.createReadStream(filename);
  const decompressedFileStream = fileStream.pipe(createGunzip());

  let headers = [];
  let samples = [];

  const sampleRegex = /^#CHROM.*?\tFORMAT\t(.*)$/;

  for await (const line of decompressedFileStream) {
    const lineString = line.toString().trim();

    if (lineString.startsWith("##")) {
      // Skip header lines
      continue;
    } else if (lineString.startsWith("#")) {
      // Parse column headers
      headers = lineString.split("\t");
      headers[0] = headers[0].substring(1);
      continue;
    }

    if (headers.length === 0) {
      throw new Error("Missing header information.");
    }

    if (lineString.startsWith("#CHROM")) {
      // Parse sample names
      const matches = lineString.match(sampleRegex);

      if (matches && matches[1]) {
        samples = matches[1].split("\t");
      }

      continue;
    }

    const fields = lineString.split("\t");

    const pos = parseInt(fields[1]);
    const dp = parseInt(getValueFromInfoField(fields[7], "DP"));
    const gene = await getVariantGene(fields[0], pos);

    if (isValidVariant(pos, dp, gene)) {
      for (let i = 0; i < samples.length; i++) {
        const sampleName = samples[i];

        if (!isValidSampleIndex(i)) {
          break;
        }

        const outputFile = `${sampleName}_filtered.vcf`;
        const variantLine = createVariantLine(
          fields,
          headers,
          sampleName,
          gene
        );

        fs.appendFileSync(outputFile, variantLine + "\n");

        if (
          limit &&
          fs.readFileSync(outputFile, "utf-8").trim().split("\n").length >=
            limit
        ) {
          break;
        }
      }
    }
  }
}

module.exports = {
  parseVCFFile,
};
