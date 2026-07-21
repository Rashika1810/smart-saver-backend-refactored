const express = require("express");

const protect = require("../middleware/authMiddleware");
const { chatWithAI } = require("../controllers/aiChatController");

const router = express.Router();

router.post("/chat", protect, chatWithAI);

module.exports = router;