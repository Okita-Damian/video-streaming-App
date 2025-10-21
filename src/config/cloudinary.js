require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const AppError = require("../utils/appError");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "videos",
    resource_type: "video",
    format: "mp4",
  },
});

// filter invalid files before upload
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("video/")) {
    return cb(new AppError("Only video files are allowed", 400), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = { cloudinary, upload };
