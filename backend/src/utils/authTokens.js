const jwt = require("jsonwebtoken");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return process.env.JWT_SECRET;
}

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      userType: user.userType,
      role: user.role || user.userType
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
}

function signPasswordResetToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      type: "password-reset",
      version: user.passwordResetTokenVersion
    },
    getJwtSecret(),
    {
      expiresIn: "15m"
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signAccessToken,
  signPasswordResetToken,
  verifyToken
};
