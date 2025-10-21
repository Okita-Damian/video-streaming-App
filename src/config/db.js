const mongoose = require("mongoose");
require("dotenv").config();

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB is Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connection;
