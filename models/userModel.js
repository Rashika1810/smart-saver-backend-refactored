const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    // ✅ Verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    verificationExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
userSchema.index(
  { verificationExpires: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      isVerified: false,
    },
  },
);
module.exports = mongoose.model("User", userSchema);
