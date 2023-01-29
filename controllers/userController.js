const User = require("../models/user");
const BigPromise = require("../middlwares/bigPromise");
const cookieToken = require("../utils/cookieToken");

const cloudinary = require("cloudinary");

const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body || {};

  let result;

  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  if (!email) {
    return next(new Error("name, email and password need to be provided"));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  return cookieToken(user, res);

  res.send("sign up");
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body || {};

  // check for presence of email and password
  if (!(email && password)) {
    res.status(401).json({
      success: false,
      msg: "Please Provide all the required fields",
    });
  }

  // get user from DB
  const user = await User.findOne({ email }).select("+password");

  // if user not found in DB
  if (!user) {
    res.status(400).json({
      success: false,
      msg: "User not found in DB",
    });
  }

  // match the password
  let isPasswordCorrect = await user.isValidatedPassword(password);

  // if password do not match
  if (!isPasswordCorrect) {
    res.status(400).json({
      success: false,
      msg: "Password is incorrect",
    });
  }

  // if all goes good and we send the token
  return cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    msg: "logout success",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    res.status(401).json({
      success: false,
      msg: "Email is missing",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401).json({
      success: false,
      msg: "Email provided is not registered in our DB ",
    });
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const emailURL = `${req.protocol}://${req.host}:4000/api/v1/password/reset/${forgotToken}`;

  const message = `Copy and Paste this link in your URL and hit enter \n\n ${emailURL} `;

  try {
    await mailHelper({
      email: user.email,
      message,
      subject: "LCO Tshirt - Password reset email",
    });

    res.status(200).json({
      success: true,
      msg: "Email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ valodateBeforeSave: false });

    return res.status(500).json({
      success: false,
      msg: "Something went wrong pls try again",
      errorMsg: error,
    });
  }

  res.status(200).json({
    success: true,
    msg: "logout success",
  });
});

// when u don't know the old password
exports.resetPassword = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.status(200).json({
      success: false,
      msg: `Please send valid token - ${token}`,
    });
  }

  if (!req.body.password) {
    res.status(200).json({
      success: false,
      msg: `Please send us password`,
    });
  }

  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    user,
    token: `${token}`,
  });
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// when u know the old password
exports.changePassword = BigPromise(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword)) {
    return res.status(400).json({
      success: false,
      msg: "Please provide old and new password",
    });
  }

  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidatedPassword(oldPassword);

  if (!isCorrectOldPassword) {
    return res.statue(400).json({
      success: false,
      msg: "Old password is incorrect",
    });
  }

  user.password = newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!(email && name)) {
    return res.status(401).json({
      success: false,
      msg: "Email and name both is required",
    });
  }

  const newData = {
    name,
    email,
  };

  if (req.files && req.files.photo) {
    // updating images

    const user = await User.findById(userId);

    const imageId = user.photo.id;

    // delete photo on cloudinary
    const res = await cloudinary.v2.uploader.destroy(imageId);

    let file = req.files.photo;

    // upload new photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    msg: "Updated Successfully",
    user,
  });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetSingleUser = BigPromise(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(200).json({
        success: false,
        msg: "No user found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("error", error);
    res.status(200).json({
      success: false,
      msg: "Something went wrong",
    });
  }
});


exports.adminUpdateSingleUser = BigPromise(async (req, res, next) => {
  const userId = req.params.id;
  const { name, email, role } = req.body;

  if (!(email && name)) {
    return res.status(401).json({
      success: false,
      msg: "Email and name both is required",
    });
  }

  const newData = {
    name,
    email,
    role
  };

  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    msg: "Updated Successfully",
    user,
  });
});


exports.adminDeleteSingleUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
      res.status(200).json({
        success: false,
        msg: "No user found",
      });
    }

    const imageId = user.photo.id

    await cloudinary.v2.uploader.destroy(imageId)

    await user.remove()
    

    res.status(200).json({
      success: true,
      msg: "Deleted Successfully",
      user,
    });
})

exports.managerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });
  res.status(200).json({
    success: true,
    users,
  });
});
