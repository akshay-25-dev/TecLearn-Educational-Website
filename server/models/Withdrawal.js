const mongoose = require("mongoose");

// A single payout request made by an instructor against their earned balance.
const withdrawalSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Paid"],
      default: "Pending",
    },

    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
