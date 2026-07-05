const express = require("express");

const router = express.Router();

const {
  getFavorites,
  createFavorite,
  addFavoriteTransaction
} = require("../controllers/favoriteTransactionController");

const protect = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getFavorites);

router.post("/", createFavorite);

router.post("/:id/add", addFavoriteTransaction);

module.exports = router;
