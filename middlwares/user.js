const User = require("../models/user");

const BigPromise = require("./bigPromise");

const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.header("Authorization") &&
      req.header("Authorization").replace("Bearer ", ""));

  if (!token) {
    return res.status(400).json({
      success: false,
      msg: "Pls provide token",
    });
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(400).json({
        success: false,
        msg: "U are not allowed for this resource",
      });
    }
    next();
  };
};
