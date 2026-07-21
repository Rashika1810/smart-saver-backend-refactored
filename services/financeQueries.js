const mongoose = require("mongoose");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

async function getSavings(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const [incomeAgg, expenseAgg, user] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: objectId, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    Transaction.aggregate([
      { $match: { user: objectId, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    User.findById(objectId).select("openingBalance"),
  ]);

  const income = incomeAgg[0]?.total || 0;
  const expense = expenseAgg[0]?.total || 0;
  const opening = user?.openingBalance || 0;

  return opening + income - expense;
}

async function getCategoryExpense(userId, category) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: objectId,
        type: "expense",
        category,
      },
    },
    {
      $group: {
        _id: "$merchant",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const total = result.reduce((sum, item) => sum + item.total, 0);

  return { total, merchants: result.slice(0, 5) };
}

async function getTopMerchant(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: objectId,
        merchant: { $ne: "" },
      },
    },
    {
      $group: {
        _id: "$merchant",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);

  return result[0];
}

async function getBiggestTransaction(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);

  return Transaction.findOne({ user: objectId })
    .sort({ amount: -1 })
    .select("amount category merchant description date type");
}

async function getMonthDetails(userId, month, year) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const categories = await Transaction.aggregate([
    {
      $match: {
        user: objectId,
        type: "expense",
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const total = categories.reduce((sum, c) => sum + c.total, 0);

  return { total, categories };
}

module.exports = {
  getSavings,
  getCategoryExpense,
  getTopMerchant,
  getBiggestTransaction,
  getMonthDetails,
};