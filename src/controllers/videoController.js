const axios = require("axios");
const Video = require("../models/videoModel");
const asyncHandler = require("../middleware/asyncHandler");
const {
  videoSchema,
  updateVideoSchema,
} = require("../validation/videoValidation");
const AppError = require("../utils/appError");
const { cloudinary } = require("../config/cloudinary");

exports.uploadVideo = asyncHandler(async (req, res, next) => {
  const { error, value } = videoSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return next(
      new AppError(error.details.map((d) => d.message).join(", "), 400)
    );
  }

  if (!req.file) {
    return next(new AppError("No video file uploaded", 400));
  }
  const newVideo = await Video.create({
    ...value,
    url: req.file.path, // Cloudinary video URL
    size: req.file.size || 0,
    publicId: req.file.filename, // Cloudinary public ID
    uploadedBy: value.uploadedBy || "admin",
  });

  res.status(201).json({
    status: "success",
    message: "Video uploaded successfully",
    data: newVideo,
  });
});

exports.getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;

  const filter = {};
  if (category) filter.category = category;

  const videos = await Video.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    status: "success",
    page: Number(page),
    limit: Number(limit),
    results: videos.length,
    data: videos,
  });
});

// controllers/videoController.js
exports.getVideoById = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);
  if (!video) return next(new AppError("Video not found", 404));

  res.status(200).json({
    status: "success",
    data: {
      title: video.title,
      description: video.description,
      url: video.url,
    },
  });
});

exports.streamVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);
  if (!video) return next(new AppError("Video not found", 404));

  const userId = req.user && req.user._id ? req.user._id.toString() : req.ip;

  if (!video.viewedBy.includes(userId)) {
    video.views += 1;
    video.viewedBy.push(userId);
    await video.save();
  }

  const videoUrl = video.url.replace("/upload/", "/upload/f_auto,q_auto/");
  const range = req.headers.range;

  const headResponse = await axios.head(videoUrl);
  const videoSize = parseInt(headResponse.headers["content-length"], 10);
  const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB

  if (range) {
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const headers = { Range: `bytes=${start}-${end}` };

    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
      headers,
      timeout: 0,
    });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=31536000, immutable",
    });

    return response.data.pipe(res);
  }

  // Fallback (no range header)
  const response = await axios({
    url: videoUrl,
    method: "GET",
    responseType: "stream",
  });

  res.writeHead(200, {
    "Content-Length": videoSize,
    "Content-Type": "video/mp4",
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  response.data.pipe(res);
});

// exports.streamVideo = asyncHandler(async (req, res, next) => {
//   const video = await Video.findById(req.params.id);
//   if (!video) return next(new AppError("Video not found", 404));

//   // 🔎 Check if it’s an HLS (m3u8) or MP4 file
//   if (video.url.endsWith(".m3u8")) {
//     // HLS adaptive streaming (best for large files)
//     return res.redirect(video.url);
//   }

//   // For MP4, serve optimized direct Cloudinary URL
//   const optimizedUrl = video.url.replace("/upload/", "/upload/f_auto,q_auto,w_720/");
//   return res.redirect(optimizedUrl);
// });

exports.updateVideo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { error, value: validatedValue } = updateVideoSchema.validate(
    req.body,
    {
      abortEarly: false,
    }
  );

  if (error) {
    return next(
      new AppError(error.details.map((d) => d.message).join(", "), 400)
    );
  }

  const video = await Video.findById(id);
  if (!video) return next(new AppError("Video not found", 404));

  if (req.file) {
    if (video.publicId) {
      await cloudinary.uploader.destroy(video.publicId, {
        resource_type: "video",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      chunk_size: 6000000, // 6MB chunks for large files
    });

    video.url = uploadResult.secure_url;
    video.publicId = uploadResult.public_id;
  }

  if (validatedValue && Object.keys(validatedValue).length > 0) {
    Object.assign(video, validatedValue);
  }

  await video.save();

  res.status(200).json({
    status: "success",
    message: "Video updated successfully",
    data: video,
  });
});

exports.searchVideos = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const videos = await Video.find({
    title: { $regex: query, $options: "i" },
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: videos.length,
    data: videos,
  });
});

exports.getTrendingVideo = asyncHandler(async (req, res) => {
  const videos = await Video.find().sort({ views: -1 }).limit(10);

  res.status(200).json({
    results: videos.length,
    status: "success",
    data: videos,
  });
});

exports.deleteVideo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) return next(new AppError("Video not found", 400));

  if (video.publicId)
    await cloudinary.uploader.destroy(video.publicId, {
      resource_type: "video",
    });

  await video.deleteOne();

  res.status(200).json({
    status: "success",
    message: "Video deleted successfully",
  });
});
