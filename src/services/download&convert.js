const axios = require('axios');
const fs = require('fs');
const gunzip = require('gunzip-file');

const url = 'https://s3.amazonaws.com/resources.genoox.com/homeAssingment/demo_vcf_multisample.vcf.gz';
const downloadFolderPath = 'downloads/'; // Specify the folder path here
const gzippedFile = downloadFolderPath + 'output.vcf.gz';
const outputFile = downloadFolderPath + 'output.vcf';

async function downloadFile() {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    });

    const fileStream = fs.createWriteStream(gzippedFile);
    response.data.pipe(fileStream);

    return new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
  } catch (error) {
    throw new Error('Error downloading the file:', error);
  }
}

async function convertFileToText() {
  try {
    await downloadFile();
    await gunzip(gzippedFile, outputFile);
    console.log('File converted to text successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

convertFileToText();