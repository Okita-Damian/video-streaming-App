require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/appError");

const videoRoutes = require("./routes/videoRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRouts");
const passwordRoutes = require("./routes/passwordRoutes");

app.use(
  cors({
    origin: "*", // for public testing;
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/videos", (req, res, next) => {
  console.log(`📢 ${req.method} request to ${req.originalUrl}`);
  next();
});

app.use("/videos", videoRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/auth", passwordRoutes);
app.use("/auth", otpRoutes);

app.all("/*splat", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
