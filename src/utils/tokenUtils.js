const jwt = require("jsonwebtoken");

exports.generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
