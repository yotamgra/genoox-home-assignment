const asyncHandler = require("async-handler");

// const processVcf = asyncHandler(async (req, res) => {
//   res.json(req.body);
// });
const processVcf = async (req, res) => {
    res.json(req.body);
  };
const test = asyncHandler(async (req, res) => {
    console.log("first")
  res.send("test");
});

module.exports = {
    processVcf,
    test
}
