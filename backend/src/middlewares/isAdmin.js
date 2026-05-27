function isAdmin(req, res, next) {
  // Middleware flow: verifyToken sets req.user, then this gate checks admin access.
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access is required" });
  }

  next();
}

module.exports = isAdmin;
