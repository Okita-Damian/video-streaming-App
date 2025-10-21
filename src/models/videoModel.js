const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video must have a title"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Video URL is required"],
    },
    duration: {
      type: Number,
    },
    size: {
      type: Number,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["education", "entertainment", "sports", "music", "news"],
    },
    uploadedBy: {
      type: String,
      default: "admin",
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    publicId: {
      type: String,
      required: true,
    },
    viewedBy: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Video", videoSchema);
