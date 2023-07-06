
## Genoox Automation Team Home Assignment

Welcome to the Genoox Automation Team Home Assignment repository! This project focuses on processing a .vcf file containing genetic variants. The objective is to read the variant file, apply specified parameters for filtering, and generate multiple output files accordingly.

#### Setup
To get started with the project, follow these steps:
1. Install the project dependencies using the command: `npm install`.
2.  the server using the command: `npm start`.

#### Downloading the File
To download the .vcf file to the server, please access the following URL in your browser or API client:

**URL:**  localhost:3000/process-vcf/download

#### Performing the Request
To execute the processing request, make a POST request to the following URL:

**URL:** localhost:3000/process-vcf

**Request Body:**
The request body contains parameters that control the processing and filtering of the .vcf file. Here is an explanation of each parameter:

- **start** (optional): Specifies the starting position for filtering variant lines in the sample. Only variant lines with positions greater than or equal to the start value will be included in the output.

- **end** (optional): Specifies the ending position for filtering variant lines in the sample. Only variant lines with positions less than or equal to the end value will be included in the output.

- **minDP** (optional): Specifies the minimum value for the "DP" field (read depth) in the variant lines. Only variant lines with a "DP" value larger than the minDP value will be included in the output.

- **limit** (required): Specifies the maximum number of lines to be included in the output for each sample. After outputting the specified number of lines, the processing for that sample will stop, either when reaching the end of the original VCF file or when the limit is reached.

The output variant line for each sample will include a new subfield in the INFO column named "GENE," which specifies the gene of that variant. 

By providing these parameters in the request body, you can customize the filtering and output behavior according to your requirements.

The response to this request will be the downloading of the** filtered_files.zip** file.

