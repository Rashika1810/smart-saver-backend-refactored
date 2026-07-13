const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

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
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          openingBalance: user.openingBalance,
          openingBalanceSet: user.openingBalanceSet,
        },
      },
    });
  } catch (error) {
    console.error(error);

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
          openingBalance: user.openingBalance,
          openingBalanceSet: user.openingBalanceSet,
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
        openingBalance: user.openingBalance,
        openingBalanceSet: user.openingBalanceSet,
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

/**
 * Update Opening Balance
 * PATCH /api/v1/auth/opening-balance
 */
const updateOpeningBalanceController = async (req, res) => {
  try {
    const { openingBalance } = req.body;

    if (
      openingBalance === undefined ||
      isNaN(openingBalance) ||
      Number(openingBalance) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid opening balance.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        openingBalance: Number(openingBalance),
        openingBalanceSet: true,
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Opening balance updated successfully.",
      data: {
        openingBalance: user.openingBalance,
        openingBalanceSet: user.openingBalanceSet,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update opening balance.",
    });
  }
};

module.exports = {
  registerController,
  loginController,
  profileController,
  updateOpeningBalanceController,
};
