const Transaction = require("../models/transactionModel");
const mongoose = require("mongoose");
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

    return res.status(200).json({
      success: true,
      data: {
        income,
        expense,
        balance: income - expense,
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
    const match = {
      user: new mongoose.Types.ObjectId(req.user.id),
    };

    // Year Filter
    if (req.query.year) {
      const year = Number(req.query.year);

      if (req.query.month && req.query.month !== "all") {
        const month = Number(req.query.month);

        match.date = {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        };
      } else {
        match.date = {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        };
      }
    }

    if (req.query.type && req.query.type !== "all") {
      match.type = req.query.type;
    }

    if (req.query.category && req.query.category !== "all") {
      match.category = req.query.category;
    }

    if (req.query.search) {
      match.description = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    const transactions = await Transaction.find(match).sort({
      date: 1,
    });

    let income = 0;
    let expense = 0;

    const categoryMap = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyMap = {};

    months.forEach((month) => {
      monthlyMap[month] = {
        month,
        income: 0,
        expense: 0,
      };
    });
    const weekdayMap = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    let largestExpense = null;

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);

      if (tx.type === "income") income += amount;
      else expense += amount;

      // Category totals
      if (tx.type === "expense") {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amount;
      }

      // Monthly Trend
      // Monthly Trend
      const month = tx.date.toLocaleString("default", {
        month: "short",
      });

      monthlyMap[month][tx.type] += amount;

      // Weekday
      // Weekday Spending (expenses only)
      if (tx.type === "expense") {
        const weekday = tx.date.toLocaleString("default", {
          weekday: "long",
        });

        weekdayMap[weekday] += amount;
      }

      // Largest Expense
      if (
        tx.type === "expense" &&
        (!largestExpense || amount > largestExpense.amount)
      ) {
        largestExpense = tx;
      }
    });

    res.json({
      success: true,

      data: {
        summary: {
          income,
          expense,
          balance: income - expense,
          transactionCount: transactions.length,
        },

        categoryBreakdown: Object.entries(categoryMap).map(
          ([category, amount]) => ({
            category,
            amount,
          }),
        ),

        monthlyTrend: months.map((month) => monthlyMap[month]),

        weekdaySpending: Object.entries(weekdayMap).map(([day, amount]) => ({
          day,
          amount,
        })),

        largestExpense,

        recentTransactions: transactions.slice(-5).reverse(),
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
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
