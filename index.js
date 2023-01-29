const app = require("./app");
require("dotenv").config();
const connectWithDb = require("./config/db")();
const cloudinary = require("cloudinary");
const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// cloudinary config goes here
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
