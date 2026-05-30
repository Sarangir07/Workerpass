const cors = require("cors");
const express = require("express");
const path = require("path");
const { corsOptions } = require("./config/cors");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const employerRoutes = require("./routes/employer.routes");
const experienceVerificationRoutes = require("./routes/experienceVerification.routes");
const jobPortalRoutes = require("./routes/jobPortal.routes");
const workerJobRoutes = require("./routes/workerJob.routes");
const workerProfileRoutes = require("./routes/workerProfile.routes");
const workerPassRoutes = require("./routes/workerPass.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

app.set("trust proxy", 1);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Workerpass API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/experience-verifications", experienceVerificationRoutes);
app.use("/api/jobs", jobPortalRoutes);
app.use("/api/worker-jobs", workerJobRoutes);
app.use("/api/worker-dashboard", workerProfileRoutes);
app.use("/api/worker-passes", workerPassRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
