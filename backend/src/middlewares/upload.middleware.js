const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(__dirname, "..", "..", "uploads", "worker-profiles");
const employerUploadRoot = path.join(__dirname, "..", "..", "uploads", "employers");
const jobApplicationUploadRoot = path.join(__dirname, "..", "..", "uploads", "job-applications");

fs.mkdirSync(uploadRoot, { recursive: true });
fs.mkdirSync(employerUploadRoot, { recursive: true });
fs.mkdirSync(jobApplicationUploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadRoot);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    callback(null, `${Date.now()}-${baseName}${extension}`);
  }
});

function fileFilter(req, file, callback) {
  const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedResumeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (file.fieldname === "profilePhoto" && allowedPhotoTypes.includes(file.mimetype)) {
    return callback(null, true);
  }

  if (file.fieldname === "resume" && allowedResumeTypes.includes(file.mimetype)) {
    return callback(null, true);
  }

  callback(new Error("Invalid file type. Upload JPG, PNG, WEBP photos and PDF, DOC, DOCX resumes."));
}

const uploadWorkerProfileFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "resume", maxCount: 1 }
]);

const employerStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, employerUploadRoot);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    callback(null, `${Date.now()}-${baseName}${extension}`);
  }
});

function employerFileFilter(req, file, callback) {
  const allowedLogoTypes = ["image/jpeg", "image/png", "image/webp"];

  if (file.fieldname === "companyLogo" && allowedLogoTypes.includes(file.mimetype)) {
    return callback(null, true);
  }

  callback(new Error("Invalid file type. Upload JPG, PNG, or WEBP company logos."));
}

const uploadCompanyLogo = multer({
  storage: employerStorage,
  fileFilter: employerFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).fields([{ name: "companyLogo", maxCount: 1 }]);

const jobApplicationStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, jobApplicationUploadRoot);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    callback(null, `${Date.now()}-${baseName}${extension}`);
  }
});

function jobApplicationFileFilter(req, file, callback) {
  const allowedResumeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (file.fieldname === "resume" && allowedResumeTypes.includes(file.mimetype)) {
    return callback(null, true);
  }

  callback(new Error("Invalid file type. Upload PDF, DOC, or DOCX resumes."));
}

const uploadJobApplicationResume = multer({
  storage: jobApplicationStorage,
  fileFilter: jobApplicationFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).fields([{ name: "resume", maxCount: 1 }]);

module.exports = {
  uploadWorkerProfileFiles,
  uploadCompanyLogo,
  uploadJobApplicationResume
};
