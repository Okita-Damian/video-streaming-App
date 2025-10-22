const bcrypt = require("bcryptjs");
const otpModel = require("../models/otpModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../middleware/asyncHandler");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// VERIFY OTP
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return next(new AppError("Email and OTP are required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const otpDoc = await otpModel
    .findOne({
      userId: user._id,
      purpose: { $in: ["verify-email", "reset-password"] },
    })
    .sort({ createdAt: -1 });

  if (!otpDoc || otpDoc.expiresAt < Date.now())
    return next(new AppError("Invalid email/Otp or expired OTP", 400));

  const match = await bcrypt.compare(String(otp), otpDoc.otp);
  if (!match) return next(new AppError("Invalid OTP", 400));

  if (otpDoc.purpose === "verify-email") {
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  await otpModel.deleteOne({ _id: otpDoc._id });

  res.json({
    status: "success",
    message: otpDoc.purpose === "verify-email" ? "Email verified" : "OTP valid",
  });
});

// RESEND OTP
exports.resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const purpose = "verify-email";

  if (purpose === "verify-email" && user.isEmailVerified)
    return next(new AppError("Email already verified", 400));

  const last = await otpModel.findOne({ userId: user._id, purpose }).sort({
    createdAt: -1,
  });

  if (last && Date.now() - new Date(last.createdAt).getTime() < 30 * 1000) {
    return next(new AppError("Please wait before requesting another OTP", 429));
  }

  await otpModel.deleteMany({ userId: user._id, purpose });

  const otp = generateOTP();
  const hashed = await bcrypt.hash(otp, 12);

  await otpModel.create({
    userId: user._id,
    otp: hashed,
    purpose,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  await sendEmail({
    to: user.email,
    subject: "New OTP - Video Stream App",
    templatePath: "../templates/otpEmail.html",
    replacements: {
      name: user.fullname || "user",
      otp,
      year: new Date().getFullYear(),
    },
  });

  res.status(200).json({
    status: "success",
    message: "New OTP sent to your email.",
  });
});
