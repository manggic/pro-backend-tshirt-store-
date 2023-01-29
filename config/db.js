const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

const connectWithDb = () => {
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log(`DB is successfully connected`))
    .catch((err) => {
      console.log("DB ERROR", error);
      process.exit(1);
    });
};

module.exports = connectWithDb;
