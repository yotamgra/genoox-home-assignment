const asyncHandler = require("async-handler");
const vcfService = require("../services/vcfService");

// const processVcf = asyncHandler(async (req, res) => {
//   res.json(req.body);
// });
const processVcf = async (req, res) => {
  const { start, end, minDP, limit } = req.body;
  await vcfService.parseVCFFile("C:/Users/yotam/genoox-home-assignment/sevices/output.vcf",start, end, minDP, limit);
  res.json(req.body);
};
const test = asyncHandler(async (req, res) => {
  console.log("first");
  res.send("test");
});

module.exports = {
  processVcf,
  test,
};
