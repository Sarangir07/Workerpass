const cors = require("cors");
const express = require("express");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const workerProfileRoutes = require("./routes/workerProfile.routes");
const workerPassRoutes = require("./routes/workerPass.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Workerpass API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/worker-profiles", workerProfileRoutes);
app.use("/api/worker-passes", workerPassRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  let statusCode = error.name === "ValidationError" ? 400 : 500;

  if (error.code === 11000) {
    statusCode = 409;
  }

  if (error.name === "MulterError" || error.message?.startsWith("Invalid file type")) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message: error.code === 11000 ? "Duplicate value already exists" : error.message || "Internal server error"
  });
});

module.exports = app;
