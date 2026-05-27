function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, req, res, next) {
  console.error(`${req.method} ${req.originalUrl} failed:`, error.message);

  let statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);

  if (error.code === 11000) {
    statusCode = 409;
  }

  if (error.name === "CastError") {
    statusCode = 400;
  }

  if (error.name === "MulterError" || error.message?.startsWith("Invalid file type")) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message: error.code === 11000 ? "Duplicate value already exists" : error.message || "Internal server error"
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
