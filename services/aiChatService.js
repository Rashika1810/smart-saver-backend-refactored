const mongoose = require("mongoose");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const { generateContent } = require("./geminiServices");
const buildFinancePrompt = require("./prompts/financePrompt");
const { detectIntent } = require("./financeIntentService");

const {
  getSavings,
  getCategoryExpense,
  getTopMerchant,
  getBiggestTransaction,
  getMonthDetails,
} = require("./financeQueries");

async function buildFinancialContext(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const [
    incomeAgg,
    expenseAgg,
    categoryBreakdown,
    merchantBreakdown,
    biggest,
    recent,
    user,
    monthlyTrend,
    paymentTypes,
    frequentMerchants,
    totalTransactions,
  ] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          user: objectId,
          type: "income",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          user: objectId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          user: objectId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          user: objectId,
          merchant: {
            $ne: "",
          },
        },
      },
      {
        $group: {
          _id: "$merchant",
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
      {
        $limit: 10,
      },
    ]),

    Transaction.find({
      user: objectId,
    })
      .sort({
        amount: -1,
      })
      .limit(10)
      .select("amount category merchant description date type"),

    Transaction.find({
      user: objectId,
    })
      .sort({
        date: -1,
      })
      .limit(15)
      .select("amount category merchant description date type"),

    User.findById(objectId).select("openingBalance"),

    Transaction.aggregate([
      {
        $match: {
          user: objectId,
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$date",
            },
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
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          user: objectId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$paymentType",
          total: {
            $sum: "$amount",
          },
        },
      },
    ]),

    Transaction.aggregate([
      {
        $match: {
          user: objectId,
          merchant: {
            $ne: "",
          },
        },
      },
      {
        $group: {
          _id: "$merchant",
          visits: {
            $sum: 1,
          },
          spent: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          visits: -1,
        },
      },
      {
        $limit: 10,
      },
    ]),

    Transaction.countDocuments({
      user: objectId,
    }),
  ]);

  const income = incomeAgg[0]?.total || 0;
  const expense = expenseAgg[0]?.total || 0;
  const opening = user?.openingBalance || 0;
  const balance = opening + income - expense;

  const savings = balance;

  return {
    openingBalance: opening,
    income,
    expense,
    balance,
    savings,
    totalTransactions,
    categoryBreakdown,
    merchantBreakdown,
    paymentTypes,
    frequentMerchants,
    monthlyTrend,
    biggest,
    recent,
  };
}

async function generateFinanceResponse({
  userId,
  message,
  history = [],
}) {
  const detected = detectIntent(message);

  switch (detected.intent) {
    case "SAVINGS": {
      const savings = await getSavings(userId);

      return `## 💰 Current Savings

Your current savings are **₹${savings.toLocaleString()}**!`; 
    }

    case "CATEGORY_EXPENSE": {
      const data = await getCategoryExpense(userId, detected.category);

      const merchants = data.merchants
        .map((m) => `- **${m._id || "Unknown"}**: ₹${m.total.toLocaleString()}`)
        .join("\n");

      return `## 🍔 ${detected.category} Expenses

Total spent: **₹${data.total.toLocaleString()}**

### Top Merchants
${merchants || "- No merchants found"}`;
    }

    case "TOP_MERCHANT": {
      const merchant = await getTopMerchant(userId);

      if (!merchant) return "I couldn't find any merchant data.";

      return `## 🏪 Top Merchant

You spent the most with **${merchant._id}** for a total of **₹${merchant.total.toLocaleString()}**.`;
    }

    case "BIGGEST_TRANSACTION": {
      const tx = await getBiggestTransaction(userId);

      if (!tx) return "No transactions found.";

      return `## 💸 Biggest Transaction

- Amount: **₹${tx.amount.toLocaleString()}**
- Category: **${tx.category}**
- Merchant: **${tx.merchant || "N/A"}**
- Date: **${new Date(tx.date).toLocaleDateString()}**`;
    }

    case "MONTH_DETAILS": {
      const data = await getMonthDetails(userId, detected.month, detected.year);

      const categoryLines = data.categories
        .map((c) => `- **${c._id}**: ₹${c.total.toLocaleString()}`)
        .join("\n");

      return `## 📅 June 2026 Expenses

Total expenses: **₹${data.total.toLocaleString()}**

### Category Breakdown
${categoryLines || "- No expenses found"}`;
    }

    default: {
      const context = await buildFinancialContext(userId);

      const conversation = history
        .slice(-6)
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n");

      const prompt = buildFinancePrompt({
        context,
        conversation,
        message,
      });

      return await generateContent(prompt);
    }
  }
}

module.exports = {
  generateFinanceResponse,
};
