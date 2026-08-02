const mongoose = require("mongoose");

// Stores a record of every completed course purchase so it can be
// shown back to the student on the "Purchase History" dashboard page.
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    razorpay_order_id: {
      type: String,
    },

    razorpay_payment_id: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
