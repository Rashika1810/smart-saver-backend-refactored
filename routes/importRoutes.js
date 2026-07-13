const express = require("express");
const multer = require("multer");

const protect = require("../middleware/authMiddleware");

const { importPhonePeStatement } = require("../controllers/importController");

const router = express.Router();

/*
=========================
Multer Configuration
=========================
*/

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },

  fileFilter(req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF statements are allowed."), false);
    }

    cb(null, true);
  },
});

/*
=========================
Import PhonePe Statement
=========================
*/

router.post(
  "/phonepe",
  protect,
  upload.single("statement"),
  importPhonePeStatement,
);

module.exports = router;
