const { body, query, validationResult } = require("express-validator");

/**
 * Create Transaction Validation
 */
const createTransactionValidator = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Description cannot exceed 250 characters"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date"),
];

/**
 * Update Transaction Validation
 */
const updateTransactionValidator = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),

  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Description cannot exceed 250 characters"),

  body("date").optional().isISO8601().withMessage("Invalid date"),
];

/**
 * Query Validation
 */
const transactionQueryValidator = [
  query("page").optional().isInt({ min: 1 }),

  query("limit").optional().isInt({ min: 1, max: 100 }),

  query("type").optional().isIn(["income", "expense"]),

  query("search").optional().trim(),

  query("category").optional().trim(),
];

/**
 * Validation Middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  createTransactionValidator,
  updateTransactionValidator,
  transactionQueryValidator,
  validate,
};
