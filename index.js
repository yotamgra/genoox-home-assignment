const axios = require('axios');
const fs = require('fs');

const url = 'https://resources.genoox.com/homeAssingment/demo_vcf_multisample.vcf.gz';
const outputFile = 'output.vcf.gz';

async function downloadFile() {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    });

    const fileStream = fs.createWriteStream(outputFile);
    response.data.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
  } catch (error) {
    throw new Error('Error downloading the file:', error);
  }
}

downloadFile()
  .then(() => {
    console.log('File downloaded successfully.');
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });