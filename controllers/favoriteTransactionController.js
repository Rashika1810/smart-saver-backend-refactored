const FavoriteTransaction = require("../models/favoriteTransactionModel");
const Transaction = require("../models/transactionModel");
const mongoose = require("mongoose");
const getFavorites = async (req, res) => {
  try {
    const favorites = await FavoriteTransaction.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites.",
    });
  }
};
const createFavorite = async (req, res) => {
  try {
    const exists = await FavoriteTransaction.findOne({
      user: req.user.id,
      type: req.body.type,
      category: req.body.category,
      description: req.body.description,
    });

    if (exists) {
      return res.status(200).json({
        success: true,
        message: "Already exists",
        data: exists,
      });
    }
    const favorite = await FavoriteTransaction.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Favorite added successfully.",
      data: favorite,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create favorite.",
    });
  }
};
const addFavoriteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid favorite ID",
      });
    }

    const favorite = await FavoriteTransaction.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      amount: favorite.amount,
      type: favorite.type,
      category: favorite.category,
      description: favorite.description,
      date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Transaction added",
      data: transaction,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add transaction",
    });
  }
};
module.exports = {
  getFavorites,
  createFavorite,
  addFavoriteTransaction
};
