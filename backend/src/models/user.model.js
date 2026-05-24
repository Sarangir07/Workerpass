const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const USER_TYPES = ["worker", "employer", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    userType: {
      type: String,
      enum: USER_TYPES,
      required: true
    },
    isOtpVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOtp: {
      type: String,
      select: false
    },
    emailVerificationOtpExpiresAt: {
      type: Date,
      select: false
    },
    passwordResetOtp: {
      type: String,
      select: false
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      select: false
    },
    passwordResetTokenVersion: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.setEmailVerificationOtp = async function setEmailVerificationOtp(otp) {
  this.emailVerificationOtp = await bcrypt.hash(otp, 10);
  this.emailVerificationOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
};

userSchema.methods.setPasswordResetOtp = async function setPasswordResetOtp(otp) {
  this.passwordResetOtp = await bcrypt.hash(otp, 10);
  this.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
};

userSchema.methods.verifyEmailOtp = async function verifyEmailOtp(otp) {
  if (!this.emailVerificationOtp || this.emailVerificationOtpExpiresAt < new Date()) {
    return false;
  }

  return bcrypt.compare(otp, this.emailVerificationOtp);
};

userSchema.methods.verifyPasswordResetOtp = async function verifyPasswordResetOtp(otp) {
  if (!this.passwordResetOtp || this.passwordResetOtpExpiresAt < new Date()) {
    return false;
  }

  return bcrypt.compare(otp, this.passwordResetOtp);
};

module.exports = mongoose.model("User", userSchema);
module.exports.USER_TYPES = USER_TYPES;
