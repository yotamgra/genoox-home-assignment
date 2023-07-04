const express = require("express");
const cors = require("cors");
const vcfRoutes = require("./routes/vcfRoutes");
const errorHandler = require("./middleweare/errorMiddleweare");

const app = express();
const port = 3000;

app.use(cors());

//Accepting body data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define a route - doesnt work
app.use("/process-vcf", vcfRoutes);

app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
