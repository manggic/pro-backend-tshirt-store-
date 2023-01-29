const express = require("express");
const {
  createOrder,
  getSingleOrder,
  getLoggedInOrder,
  adminGetAllOrders,
  adminDeleteOrder,
  adminUpdateOrder
} = require("../controllers/orderController");

const { isLoggedIn, customRole } = require("../middlwares/user");

const router = express.Router();

router.route("/order/create").post(isLoggedIn, createOrder);

router.route("/order/myorder").get(isLoggedIn, getLoggedInOrder);

router.route("/order/:id").get(isLoggedIn, getSingleOrder);

// admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);

router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOrder);


  

module.exports = router;
