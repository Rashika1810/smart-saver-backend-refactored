const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createTransactionValidator,
  updateTransactionValidator,
  transactionQueryValidator,
  validate,
} = require("../validators/transactionValidators.js");

const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyAnalytics,
  getAnalytics
} = require("../controllers/transactionController");

/*
==========================================
Dashboard
==========================================
*/

// Dashboard Summary
router.get("/summary", protect, getSummary);

// Monthly Analytics
router.get("/analytics/monthly", protect, getMonthlyAnalytics);

/*
==========================================
Transactions CRUD
==========================================
*/

// Get All Transactions
router.get("/", protect, transactionQueryValidator, validate, getTransactions);

router.get("/analytics", protect, getAnalytics);

// Get Single Transaction
router.get("/:id", protect, getTransaction);

// Create Transaction
router.post(
  "/",
  protect,
  createTransactionValidator,
  validate,
  createTransaction,
);

// Update Transaction
router.put(
  "/:id",
  protect,
  updateTransactionValidator,
  validate,
  updateTransaction,
);

// Delete Transaction
router.delete("/:id", protect, deleteTransaction);

module.exports = router;
