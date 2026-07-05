const mongoose = require("mongoose");

const favoriteTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

favoriteTransactionSchema.index({
  user: 1,
});

module.exports = mongoose.model(
  "FavoriteTransaction",
  favoriteTransactionSchema,
);
