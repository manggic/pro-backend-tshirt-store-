const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  adminGetSingleUser,
  adminUpdateSingleUser,
  adminDeleteSingleUser
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlwares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);

router.route("/password/reset/:token").post(resetPassword);

router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);

router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);

// admin only route
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);

// manager only route
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminGetSingleUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateSingleUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteSingleUser )


module.exports = router;
