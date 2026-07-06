const RecurringTransaction = require("../models/recurringTransactionModel");
const mongoose = require("mongoose");
const { generateRecurringTransactions } = require("../services/recurringService");

const createRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: recurring,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: recurring,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateRecurring = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const recurring = await RecurringTransaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      req.body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: recurring,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteRecurring = async (req, res) => {
  try {
    await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    res.json({
      success: true,
      message: "Recurring transaction deleted.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const runRecurringTransactions = async (req, res) => {
  try {
    const count = await generateRecurringTransactions();

    return res.status(200).json({
      success: true,
      message: `${count} transaction(s) generated.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Generation failed.",
    });
  }
};

module.exports = {
  createRecurring,
  getRecurring,
  updateRecurring,
  deleteRecurring,
  runRecurringTransactions
};