const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getDashboardInsight,
} = require("../controllers/aiController");

router.get(
  "/dashboard-insight",
  protect,
  getDashboardInsight
);

module.exports = router;