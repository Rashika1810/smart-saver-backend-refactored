const mongoose = require("mongoose");

const statementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    source: {
      type: String,
      enum: ["phonepe"],
      default: "phonepe",
    },

    fileName: {
      type: String,
      required: true,
    },

    statementStartDate: {
      type: Date,
      required: true,
    },

    statementEndDate: {
      type: Date,
      required: true,
    },

    totalTransactions: {
      type: Number,
      default: 0,
    },

    importedTransactions: {
      type: Number,
      default: 0,
    },

    duplicateTransactions: {
      type: Number,
      default: 0,
    },

    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

statementSchema.index({
  user: 1,
  statementStartDate: -1,
});

module.exports = mongoose.model("Statement", statementSchema);