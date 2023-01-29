const Order = require("../models/order");

const Product = require("../models/product");

const BigPromise = require("../middlwares/bigPromise");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    msg: "Order is placed successfully",
    order,
  });
});

exports.getSingleOrder = BigPromise(async (req, res, next) => {
  let order;
  try {
    order = await Order.findById(req.params.id).populate("user", "name email");
  } catch (error) {
    return res.status(200).json({
      success: false,
      msg: "Please check order Id",
    });
  }

  if (!order) {
    return res.status(200).json({
      success: false,
      msg: "Please check order Id",
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInOrder = BigPromise(async (req, res) => {
  const order = await Order.find({ user: req.user._id });
  if (!order) {
    return res.status(200).json({
      success: false,
      msg: "Please check order Id",
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = BigPromise(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "delivered") {
    return res.status(200).json({
      success: false,
      msg: "Order is already marked for delivered",
    });
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    orders,
  });
});


exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  await order.remove();
  res.status(200).json({
    success: true,
    msg: 'Order is deleted',
  });
});


async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}






