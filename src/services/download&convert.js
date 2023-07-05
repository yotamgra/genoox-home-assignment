import axios from 'axios';
import fs from 'fs';
import zlib from 'zlib';

const url = 'https://s3.amazonaws.com/resources.genoox.com/homeAssingment/demo_vcf_multisample.vcf.gz';
const downloadFolderPath = 'src/downloads/'; // Specify the folder path here
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

export const convertFileToText= async()=> {
  try {
    await downloadFile();

    const inputStream = fs.createReadStream(gzippedFile);
    const outputStream = fs.createWriteStream(outputFile);

    await new Promise((resolve, reject) => {
      inputStream
        .pipe(zlib.createGunzip())
        .pipe(outputStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    console.log('File converted to text successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

