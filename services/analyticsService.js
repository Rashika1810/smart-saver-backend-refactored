const Transaction = require("../models/transactionModel");
const mongoose = require("mongoose");

const calculateAnalytics = async (userId, query = {}) => {
  const match = {
    user: new mongoose.Types.ObjectId(userId),
  };

  // Year Filter
  if (query.year) {
    const year = Number(query.year);

    if (query.month && query.month !== "all") {
      const month = Number(query.month);

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

  // Type Filter
  if (query.type && query.type !== "all") {
    match.type = query.type;
  }

  // Category Filter
  if (query.category && query.category !== "all") {
    match.category = query.category;
  }

  // Search
  if (query.search) {
    match.description = {
      $regex: query.search,
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

    if (tx.type === "income") {
      income += amount;
    } else {
      expense += amount;

      // Category totals
      categoryMap[tx.category] =
        (categoryMap[tx.category] || 0) + amount;

      // Largest expense
      if (!largestExpense || amount > largestExpense.amount) {
        largestExpense = tx;
      }
    }

    // Monthly trend
    const month = tx.date.toLocaleString("default", {
      month: "short",
    });

    monthlyMap[month][tx.type] += amount;

    // Weekday spending
    if (tx.type === "expense") {
      const weekday = tx.date.toLocaleString("default", {
        weekday: "long",
      });

      weekdayMap[weekday] += amount;
    }
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const weekdaySpending = Object.entries(weekdayMap).map(
    ([day, amount]) => ({
      day,
      amount,
    })
  );

  const topCategory =
    categoryBreakdown.length > 0
      ? categoryBreakdown[0]
      : null;

  const highestWeekday =
    weekdaySpending.length > 0
      ? weekdaySpending.reduce((max, current) =>
          current.amount > max.amount ? current : max
        )
      : null;

  const savingsRate =
    income > 0
      ? Number((((income - expense) / income) * 100).toFixed(1))
      : 0;

  return {
    summary: {
      income,
      expense,
      balance: income - expense,
      savingsRate,
      transactionCount: transactions.length,
    },

    categoryBreakdown,

    topCategory,

    monthlyTrend: months.map((month) => monthlyMap[month]),

    weekdaySpending,

    highestWeekday,

    largestExpense,

    recentTransactions: transactions.slice(-5).reverse(),
  };
};

module.exports = {
  calculateAnalytics,
};