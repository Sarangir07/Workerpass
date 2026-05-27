const ExperienceVerification = require("../models/experienceVerification.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");

const userSelectFields = "-password -emailVerificationOtp -passwordResetOtp";

function roleFilter(role) {
  return {
    $or: [{ role }, { userType: role }]
  };
}

async function getDashboard(req, res) {
  try {
    const [totalUsers, totalWorkers, totalEmployers, totalJobs, pendingVerifications] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments(roleFilter("worker")),
        User.countDocuments(roleFilter("employer")),
        Job.countDocuments(),
        ExperienceVerification.countDocuments({ verificationStatus: "Pending" })
      ]);

    res.json({
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      pendingVerifications
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard statistics" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find()
      .select(userSelectFields)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
}

async function getWorkers(req, res) {
  try {
    const workers = await User.find(roleFilter("worker"))
      .select(userSelectFields)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ workers });
  } catch (error) {
    res.status(500).json({ message: "Failed to load workers" });
  }
}

async function getEmployers(req, res) {
  try {
    const employers = await User.find(roleFilter("employer"))
      .select(userSelectFields)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ employers });
  } catch (error) {
    res.status(500).json({ message: "Failed to load employers" });
  }
}

async function getJobs(req, res) {
  try {
    const jobs = await Job.find()
      .populate("employer", "name email role userType")
      .populate("company", "companyName")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: "Failed to load jobs" });
  }
}

async function getVerifications(req, res) {
  try {
    const verifications = await ExperienceVerification.find()
      .populate("workerId", "name email role userType")
      .populate("employerId", "name email role userType")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ verifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to load verifications" });
  }
}

async function getReports(req, res) {
  try {
    res.json({
      reports: [],
      summary: {
        openReports: 0,
        resolvedReports: 0,
        monitoringStatus: "ready"
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load reports" });
  }
}

async function getAnalytics(req, res) {
  try {
    const [totalUsers, totalWorkers, totalEmployers, totalJobs, pendingVerifications] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments(roleFilter("worker")),
        User.countDocuments(roleFilter("employer")),
        Job.countDocuments(),
        ExperienceVerification.countDocuments({ verificationStatus: "Pending" })
      ]);

    res.json({
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      pendingVerifications
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load analytics" });
  }
}

async function getSettings(req, res) {
  try {
    res.json({
      settings: {
        userBlockingEnabled: true,
        employerApprovalEnabled: true,
        workerVerificationApprovalEnabled: true,
        reportsEnabled: true,
        monitoringEnabled: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load settings" });
  }
}

module.exports = {
  getDashboard,
  getUsers,
  getWorkers,
  getEmployers,
  getJobs,
  getVerifications,
  getReports,
  getAnalytics,
  getSettings
};
