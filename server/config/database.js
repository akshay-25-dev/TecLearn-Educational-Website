const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  if (!process.env.MONGODB_URL) {
    console.error("DB Connection Failed: MONGODB_URL is missing in environment variables.");
    return;
  }
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("DB Connected Successfully"))
    .catch((error) => {
      console.log("DB Connection Failed");
      console.error(error);
    });
};