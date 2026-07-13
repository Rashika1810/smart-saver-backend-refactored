const express = require("express");

const router = express.Router();

const {
  registerController,
  loginController,
  profileController,
  updateOpeningBalanceController
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const {
  registerValidator,
  loginValidator,
  validate,
} = require("../validators/authValidators");

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register User
 * @access  Public
 */
router.post("/register", registerValidator, validate, registerController);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login User
 * @access  Public
 */
router.post("/login", loginValidator, validate, loginController);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get Logged In User
 * @access  Private
 */
router.get("/profile", protect, profileController);

/**
 * @route   PATCH /api/v1/auth/opening-balance
 * @desc    Update Opening Balance
 * @access  Private
 */
router.patch(
  "/opening-balance",
  protect,
  updateOpeningBalanceController
);

module.exports = router;