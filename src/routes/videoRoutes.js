const express = require("express");
const router = express();
const videoController = require("../controllers/videoController");
const asyncHandler = require("../middleware/asyncHandler");
const { upload } = require("../config/cloudinary");
const { protect, restrictTo } = require("../middleware/auths");

// Admin: manage content
router.post(
  "/upload",
  upload.single("video"),
  protect,
  restrictTo("admin"),
  asyncHandler(videoController.uploadVideo)
);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(videoController.deleteVideo)
);
router.put(
  "/:id",
  upload.single("video"),
  protect,
  restrictTo("admin"),
  asyncHandler(videoController.updateVideo)
);

// Users: browse and watch
router.get("/trending", videoController.getTrendingVideo);

router.get("/search", asyncHandler(videoController.searchVideos));

router.get("/", asyncHandler(videoController.getAllVideos));

router.get("/:id", asyncHandler(videoController.getVideoById));

// stream only if user is logged in
router.get("/stream/:id", protect, asyncHandler(videoController.streamVideo));

module.exports = router;
