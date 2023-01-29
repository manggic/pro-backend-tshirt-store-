const express = require("express");
const {
  getStripeKey,
  getRazorpayKey,
  captureStripePayment,
  captureRazorpayPayment,
} = require("../controllers/paymentController");
const router = express.Router();

const { isLoggedIn } = require("../middlwares/user");

router.route("/stripekey").get(isLoggedIn, getStripeKey);
router.route("/razorpaykey").get(isLoggedIn, getRazorpayKey);

router.route("/capturestripe").post(isLoggedIn, captureStripePayment);
router.route("/capturerazorpay").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
