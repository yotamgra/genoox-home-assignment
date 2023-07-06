import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import vcfRoutes from "./src/routes/vcfRoutes.js";
import errorHandler from "./src/middleweare/errorMiddleweare.js";

const app = express();

dotenv.config(); 
const port = process.env.PORT || 3000;

app.use(cors());

//Accepting body data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/process-vcf", vcfRoutes);

app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
