const BigPromise = require("../middlwares/bigPromise");

// method 1 : using Promise
exports.home = BigPromise((req, res) => {
  res.status(200).json({
    success: true,
    msg: "Hello From API",
  });
});

// method 2 : using try catch and async-await
exports.homeDummy = async (req, res) => {
  try {
    // const db = await callDB
    res.status(200).json({
      success: true,
      msg: "Just Dummy",
    });
  } catch (error) {
    console.log("error", error);
  }
};
