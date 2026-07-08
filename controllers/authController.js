const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**
 * Register User
 * POST /api/v1/auth/register
 */
const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered.",
        });
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      existingUser.verificationToken = hashedToken;
      existingUser.verificationExpires = Date.now() + 1000 * 60 * 60;

      await existingUser.save();

      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

      await sendEmail(
        existingUser.email,
        "Verify your email",
        `
    <h2>Hi ${existingUser.name}</h2>
    <p>Your account already exists but hasn't been verified.</p>

    <a href="${verifyUrl}">
      Verify Email
    </a>

    <p>This link expires in 1 hour.</p>
  `,
      );

      return res.json({
        success: true,
        message:
          "Your account already exists but is not verified. A new verification email has been sent.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationToken: hashedToken,
      verificationExpires: Date.now() + 1000 * 60 * 60, // 1 hour
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail(
      normalizedEmail,
      "Verify your email",
      `
        <h2>Welcome ${name}</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}" target="_blank">Verify Email</a>
        <p>This link expires in 1 hour.</p>
      `,
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    console.error(error);
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register user.",
    });
  }
};
/**
 * Login User
 * POST /api/v1/auth/login
 */
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 🔐 BLOCK UNVERIFIED USERS (IMPORTANT ADDITION)
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

/**
 * Get Logged-in User
 * GET /api/v1/auth/profile
 */
const profileController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};
const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "Your email is already verified.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.verificationToken = hashedToken;
    user.verificationExpires = Date.now() + 1000 * 60 * 60;

    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await sendEmail(
      user.email,
      "Verify your email",
      `
        <h2>Hello ${user.name}</h2>

        <p>Click below to verify your email.</p>

        <a href="${verifyUrl}">
            Verify Email
        </a>

        <p>This link expires in 1 hour.</p>
      `,
    );

    res.json({
      success: true,
      message: "Verification email sent.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to send verification email.",
    });
  }
};
module.exports = {
  registerController,
  loginController,
  profileController,
  verifyEmailController,
  resendVerificationController,
};
