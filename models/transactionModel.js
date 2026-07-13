const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
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

    merchant: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    date: {
      type: Date,
      required: true,
    },

    // ===== NEW FIELDS =====

    source: {
      type: String,
      enum: ["manual", "phonepe"],
      default: "manual",
    },

    paymentType: {
      type: String,
      default: "UPI",
    },

    paymentAccount: {
      type: String,
      default: "",
    },

    transactionId: {
      type: String,
      default: "",
    },

    utr: {
      type: String,
      default: "",
    },

    statementMonth: {
      type: String,
      default: "",
    },

    importedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Existing Index
transactionSchema.index({
  user: 1,
  date: -1,
});

// Prevent duplicate imports
transactionSchema.index(
  {
    user: 1,
    transactionId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);