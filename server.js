const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const colors = require("colors");

const connectDb = require("./config/connectDb");

// Routes
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const recurringRoutes = require("./routes/recurringRoutes");

// Middleware
const errorHandler = require("./middleware/errorMiddleware");

// Config
dotenv.config();

// Database
connectDb();

const app = express();

// Security
app.use(helmet());

app.use(compression());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate Limiter

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests. Please try again later.",
  }),
);

// Body Parser

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Logger

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health Check

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense Tracker API Running 🚀",
  });
});

// Routes

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/transactions", transactionRoutes);

app.use("/api/v1/favorites", favoriteRoutes);

app.use("/api/v1/recurring", recurringRoutes);

// 404

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Global Error Handler

app.use(errorHandler);

// Start Server

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.green.bold);
});
