const BigPromise = require("../middlwares/bigPromise");
const User = require("../models/user");
const cloudinary = require("cloudinary");

const Product = require("../models/product");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  // images
  let imageArray = [];
  if (!req.files) {
    res.status(400).json({
      success: false,
      msg: "Please provide photo for the product",
    });
  }

  // will work only when multiple photos are provided
  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;

  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    msg: "product added successfully",
    product,
  });
});

// with query, limit pagination n all
exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;

  if (!products) {
    res.status(200).json({
      success: true,
      msg: "Product list are empty",
    });
  }

  let filteredProductCount = products.length;

  productsObj.pager(resultPerPage);

  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    productCount: filteredProductCount,
  });
});

exports.adminGetAllProduct = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(400).json({
      success: false,
      msg: "Please provide correct product ID",
    });
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminUpdateSingleProduct = BigPromise(async (req, res, next) => {
  // fetch product to update
  const product = await Product.findById(req.params.id);

  // if product not found send the error msg
  if (!product) {
    res.status(400).json({
      success: false,
      msg: "Please provide correct product id",
    });
  }

  let photosArr = [];

  // if files is uploaded
  // destroy from cloudinary
  // update in the DB
  if (req.files) {
    for (let ind = 0; ind < product.photos.length; ind++) {
      await cloudinary.v2.uploader.destroy(product.photos[ind].id);
    }

    for (let index = 0; index < req.files.photos.length; index++) {
      const resultOfCloudinary = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      photosArr.push({
        id: resultOfCloudinary.public_id,
        secure_url: resultOfCloudinary.secure_url,
      });
    }
  }

  req.body.photos = photosArr;

  const upadtedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    upadtedProduct,
  });
});

exports.adminDeleteSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(400).json({
      success: false,
      msg: "Please provide correct product id",
    });
  }

  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    product,
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment,
    name: req.user.name,
  };

  const product = await Product.findById(productId);

  const alreadyReviewed = products.review.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.comment = comment;
        rev.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // adjust rating
  let calcReview = 0;
  product.reviews.map((rev) => (calcReview = calcReview + rev.rating));

  product.ratings =
    product.reviews.reduce((acc, iten) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter((rev) => rev.user !== req.user._id);

  const numOfReviews = reviews.length;

  const ratings =
    reviews.reduce((acc, iten) => item.rating + acc, 0) / reviews.length;

  const prod = await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    prod,
  });
});

exports.getReviewsForSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
