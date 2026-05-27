const { verifyToken: verifyJwtToken } = require("../utils/authTokens");

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");
    const fallbackToken = req.headers["x-auth-token"];
    const jwtToken = scheme === "Bearer" ? token : fallbackToken;

    if (!jwtToken) {
      return res.status(401).json({ message: "Authentication token is required" });
    }

    const decoded = verifyJwtToken(jwtToken);

    // Middleware flow: verify the JWT first, then attach identity data for authorization.
    req.user = {
      ...decoded,
      role: decoded.role || decoded.userType
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}

module.exports = verifyToken;
