require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { signup, login } = require("../validation/authValidation");
const User = require("../models/userModel");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/appError");
const otpModel = require("../models/otpModel");
const { generateTokens } = require("../utils/tokenUtils");

// REGISTER (OTP email)
exports.register = asyncHandler(async (req, res, next) => {
  const { error, value } = signup.validate(req.body, { abortEarly: false });
  if (error)
    return next(
      new AppError(error.details.map((d) => d.message).join(", "), 400)
    );

  const exists = await User.findOne({ email: value.email });
  if (exists) return next(new AppError("Email already exists", 409));

  const newUser = await User.create({
    fullname: value.fullname,
    email: value.email,
    password: value.password, // plain password will be hashed by the pre-saved hook(created in the user model )
    role: value.role || "user",
  });

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 12);

  await otpModel.create({
    userId: newUser._id,
    otp: hashedOtp,
    purpose: "verify-email",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: newUser.email,
    subject: "Verify Your Email ",
    templatePath: "../templates/otpEmail.html",
    replacements: {
      name: newUser.fullname || "User",
      otp: otp,
      year: new Date().getFullYear(),
    },
  });
  res.status(201).json({
    status: "success",
    message: "User registered successfully. OTP sent to your email.",
  });
});

// LOGIN
exports.login = asyncHandler(async (req, res, next) => {
  const { error, value } = login.validate(req.body, { abortEarly: false });

  if (error)
    return next(
      new AppError(error.details.map((d) => d.message).join(", "), 400)
    );

  const { email, password } = value;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  if (!user.isEmailVerified)
    return next(new AppError("Please verify your email", 403));

  const { accessToken, refreshToken } = generateTokens(user);

  //  Save refresh token in DB
  user.refreshToken = refreshToken;
  user.isLoggedIn = true;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    status: "success",
    message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

// LOGOUT
exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_KEY);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = null;

        user.isLoggedIn = false;
        await user.save();
      }
    } catch {}
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    status: "success",
    message: "Logged out",
  });
});

// REFRESH TOKEN
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) return next(new AppError("No refresh token", 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_KEY);

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user) return next(new AppError("User not found", 401));

    if (!user || user.refreshToken !== token) {
      return next(new AppError("Invalid refresh token", 401));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshToken = newRefreshToken;

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: "success",
      token: accessToken,
    });
  } catch {
    return next(new AppError("Invalid refresh token", 401));
  }
});
