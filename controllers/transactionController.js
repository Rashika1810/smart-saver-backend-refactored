const Transaction = require("../models/transactionModel");
const mongoose = require("mongoose");
const { calculateAnalytics } = require("../services/analyticsService");
const User = require("../models/userModel");
/**
 * Create Transaction
 * POST /api/v1/transactions
 */
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    const transaction = await Transaction.create({
      amount,
      type,
      category,
      description,
      date,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create transaction.",
    });
  }
};

/**
 * Get All Transactions
 * GET /api/v1/transactions
 */
const getTransactions = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const filter = {
      user: req.user.id,
    };

    // Type Filter
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Category Filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Search
    if (req.query.search) {
      filter.description = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    // Date Range
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};

      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }
    // Month / Year Filter
    if (req.query.year) {
      const year = Number(req.query.year);

      if (req.query.month && req.query.month !== "all") {
        const month = Number(req.query.month);

        filter.date = {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        };
      } else {
        // Entire year
        filter.date = {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        };
      }
    }

    const transactions = await Transaction.find(filter)
      .sort({
        date: -1,
      })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: transactions,

      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions.",
    });
  }
};

/**
 * Get Single Transaction
 * GET /api/v1/transactions/:id
 */
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction.",
    });
  }
};
/**
 * Update Transaction
 * PUT /api/v1/transactions/:id
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ 1. Validate ObjectId FIRST
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    // ✅ 2. Find transaction with user ownership check
    const transaction = await Transaction.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    // ✅ 3. Update safely
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update transaction.",
    });
  }
};

/**
 * Delete Transaction
 * DELETE /api/v1/transactions/:id
 */
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    await transaction.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete transaction.",
    });
  }
};

/**
 * Dashboard Summary
 * GET /api/v1/transactions/summary
 */
const getSummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
        },
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    summary.forEach((item) => {
      if (item._id === "income") {
        income = item.total;
      }

      if (item._id === "expense") {
        expense = item.total;
      }
    });
    const user = await User.findById(req.user.id).select("openingBalance");

    const openingBalance = user?.openingBalance || 0;
    return res.status(200).json({
      success: true,
      data: {
        openingBalance,
        income,
        expense,
        balance: openingBalance + income - expense,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch summary.",
    });
  }
};

/**
 * Monthly Analytics
 * GET /api/v1/transactions/monthly
 */
const getMonthlyAnalytics = async (req, res) => {
  try {
    const analytics = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },
            type: "$type",
          },
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics.",
    });
  }
};
const getAnalytics = async (req, res) => {
  try {
    const analytics = await calculateAnalytics(req.user.id, req.query);

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyAnalytics,
  getAnalytics,
};
