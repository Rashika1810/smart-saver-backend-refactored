const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createRecurring,
  getRecurring,
  updateRecurring,
  deleteRecurring,
  runRecurringTransactions
} = require("../controllers/recurringController");

router.use(protect);

router.get("/", getRecurring);

router.post("/", createRecurring);

router.put("/:id", updateRecurring);

router.delete("/:id", deleteRecurring);
router.post("/run", protect, runRecurringTransactions);

module.exports = router;