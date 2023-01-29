const BigPromise = require("../middlwares/bigPromise");

const { STRIPE_API_KEY , STRIPE_SECRET, RAZORPAY_API_KEY, RAZORPAY_SECRET} = process.env;
const stripe = require('stripe')(STRIPE_SECRET)
exports.getStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripekey: STRIPE_API_KEY,
  });
});



exports.captureStripePayment  = BigPromise(async(req, res, next)=> {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
      });


      res.status(200).json({
          success: true,
          client_secret : paymentIntent.client_secret
      })
}) 


exports.getRazorpayKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
      razorPayKey: RAZORPAY_API_KEY,
    });
  });

exports.captureRazorpayPayment = BigPromise(async(req, res, next) => {
    var instance = new Razorpay({ key_id: RAZORPAY_API_KEY, key_secret: RAZORPAY_SECRET })

    const myOrder =  await instance.orders.create({
      amount: req.body.amount,
      currency: "INR",
      receipt: "receipt#1",
    })

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    })
})
