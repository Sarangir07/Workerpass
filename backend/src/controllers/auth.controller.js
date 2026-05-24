const User = require("../models/user.model");
const { signAccessToken, signPasswordResetToken, verifyToken } = require("../utils/authTokens");
const { generateOtp, includeOtpInResponse } = require("../utils/otp");

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    isOtpVerified: user.isOtpVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function signup(req, res, next) {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: "Name, email, password, and userType are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    if (userType === "admin") {
      return res.status(403).json({ message: "Use the admin signup route to create admin accounts" });
    }

    const otp = generateOtp();
    const user = new User({ name, email, password, userType });
    await user.setEmailVerificationOtp(otp);
    await user.save();

    const body = {
      message: "Signup successful. Verify OTP to activate the account.",
      user: userResponse(user),
      token: signAccessToken(user)
    };

    if (includeOtpInResponse()) {
      body.otp = otp;
    }

    res.status(201).json(body);
  } catch (error) {
    next(error);
  }
}

async function adminSignup(req, res, next) {
  try {
    const { name, email, password, setupKey } = req.body;

    if (!name || !email || !password || !setupKey) {
      return res.status(400).json({ message: "Name, email, password, and setupKey are required" });
    }

    if (!process.env.ADMIN_SETUP_KEY) {
      return res.status(500).json({ message: "ADMIN_SETUP_KEY is not configured" });
    }

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ message: "Invalid admin setup key" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email,
      password,
      userType: "admin",
      isOtpVerified: true
    });

    res.status(201).json({
      message: "Admin account created successfully",
      user: userResponse(user),
      token: signAccessToken(user)
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: userResponse(user),
      token: signAccessToken(user)
    });
  } catch (error) {
    next(error);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email, userType: "admin" }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid admin email or password" });
    }

    res.json({
      message: "Admin login successful",
      user: userResponse(user),
      token: signAccessToken(user)
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.json({ message: "Logout successful. Remove the JWT token from the client." });
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select("+passwordResetOtp +passwordResetOtpExpiresAt");

    if (!user) {
      return res.json({ message: "If the email exists, a password reset OTP has been generated" });
    }

    const otp = generateOtp();
    await user.setPasswordResetOtp(otp);
    await user.save();

    const body = {
      message: "If the email exists, a password reset OTP has been generated"
    };

    if (includeOtpInResponse()) {
      body.otp = otp;
    }

    res.json(body);
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, otp, purpose = "signup" } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationOtp +emailVerificationOtpExpiresAt +passwordResetOtp +passwordResetOtpExpiresAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (purpose === "password-reset") {
      const isValidOtp = await user.verifyPasswordResetOtp(otp);

      if (!isValidOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      await user.save();

      return res.json({
        message: "OTP verified successfully",
        resetToken: signPasswordResetToken(user)
      });
    }

    const isValidOtp = await user.verifyEmailOtp(otp);

    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpiresAt = undefined;
    await user.save();

    res.json({
      message: "OTP verified successfully",
      user: userResponse(user)
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ message: "Reset token and password are required" });
    }

    const payload = verifyToken(resetToken);

    if (payload.type !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findById(payload.id).select("+password");

    if (!user || user.passwordResetTokenVersion !== payload.version) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    user.password = password;
    user.passwordResetTokenVersion += 1;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired reset token" });
  }
}

async function me(req, res) {
  res.json({ user: userResponse(req.user) });
}

module.exports = {
  signup,
  adminSignup,
  login,
  adminLogin,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  me
};
