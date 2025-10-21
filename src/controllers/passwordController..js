const bcrypt = require("bcryptjs");
const otpModel = require("../models/otpModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../middleware/asyncHandler");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// REQUEST PASSWORD RESET
exports.requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is required"));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  await otpModel.deleteMany({ userId: user._id, purpose: "reset-password" });
  const otp = generateOTP();
  const hashed = await bcrypt.hash(otp, 12);

  await otpModel.create({
    userId: user._id,
    otp: hashed,
    purpose: "reset-password",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  // Send new OTP email
  await sendEmail({
    to: user.email,
    subject: "Password Reset Request - Video Stream App",
    templatePath: "../templates/otpEmail.html",
    replacements: {
      name: user.fullname || "User",
      otp,
      year: new Date().getFullYear(),
    },
  });

  res.status(200).json({
    status: "success",
    message: "password reset OTP sent to your email.",
  });
});

// RESET PASSWORD
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("User not found", 404));

  const otpDoc = await otpModel
    .findOne({
      userId: user._id,
      purpose: "reset-password",
    })
    .sort({ createdAt: -1 });

  if (!otpDoc || otpDoc.expiresAt < Date.now())
    return next(new AppError("Invalid or expired OTP", 400));

  const match = await bcrypt.compare(String(otp), otpDoc.otp);
  if (!match) return next(new AppError("Invalid OTP", 400));

  const same = await bcrypt.compare(newPassword, user.password);
  if (same)
    return next(new AppError("New password cannot be same as old", 400));

  user.password = newPassword;
  user.passwordChangedAt = Date.now();

  await user.save();

  await otpModel.deleteOne({ _id: otpDoc._id });

  // email confirmation
  await sendEmail({
    to: user.email,
    subject: "Password Reset Successful",
    templatePath: "../templates/passwordResetSuccess.html",
    replacements: {
      name: user.fullname || "User",
      year: new Date().getFullYear(),
    },
  });

  res.json({
    status: "success",
    message: "Password reset successfully",
  });
});
