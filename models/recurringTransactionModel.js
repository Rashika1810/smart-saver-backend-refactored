const mongoose = require("mongoose");

const recurringTransactionSchema = new mongoose.Schema(
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
      default: "",
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "custom"],
      required: true,
    },

    // Used only when frequency === "custom"
    // 0 = Sunday
    // 1 = Monday
    // ...
    // 6 = Saturday
    daysOfWeek: {
      type: [Number],
      default: [],
      validate: {
        validator: function (days) {
          return days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6);
        },
        message: "daysOfWeek must contain values between 0 and 6.",
      },
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    lastGenerated: {
      type: Date,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

recurringTransactionSchema.index({
  user: 1,
  active: 1,
});

module.exports = mongoose.model(
  "RecurringTransaction",
  recurringTransactionSchema,
);