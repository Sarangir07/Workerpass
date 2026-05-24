const User = require("../models/user.model");
const { verifyToken } = require("../utils/authTokens");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}

function authorize(...allowedUserTypes) {
  return (req, res, next) => {
    if (!req.user || !allowedUserTypes.includes(req.user.userType)) {
      return res.status(403).json({ message: "You do not have permission to access this route" });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
