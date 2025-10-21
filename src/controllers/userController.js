const User = require("../models/userModel");

const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/appError");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.find();
  res.status(200).json({
    status: "success",
    result: user.length,
    data: user,
  });
});

exports.getUserById = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.id !== req.params.id)
    return next(
      new AppError("You are not authorized to view this profile", 403)
    );
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError("User is not found", 400));
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.id !== req.params.id)
    return next(new AppError("Not authorized to update this profile", 403));

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({
    status: "success",
    message: "User deleted successfully by admin",
  });
});

exports.deleteMyAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user.id);
  if (!user) return next(new AppError("User not found"));

  res.status(200).json({
    status: "success",
    message: "Your account has been deleted successfully",
  });
});
