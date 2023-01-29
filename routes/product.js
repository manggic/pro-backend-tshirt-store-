const express = require("express");
const {
  addProduct,
  getAllProduct,
  adminGetAllProduct,
  getSingleProduct,
  adminUpdateSingleProduct,
  adminDeleteSingleProduct,
  addReview,
  deleteReview,
  getReviewsForSingleProduct,
} = require("../controllers/productController");
const { isLoggedIn, customRole } = require("../middlwares/user");

const router = express.Router();

// admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProduct);

router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateSingleProduct);

router
  .route("/admin/product/delete/:id")
  .delete(isLoggedIn, customRole("admin"), adminDeleteSingleProduct);

// user route
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getSingleProduct);

router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/product/review").get(isLoggedIn, getReviewsForSingleProduct);

module.exports = router;
