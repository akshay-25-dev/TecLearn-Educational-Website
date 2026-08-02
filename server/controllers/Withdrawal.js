const Course = require("../models/Course");
const Withdrawal = require("../models/Withdrawal");

// Small helper shared by both endpoints below: totals up everything the
// instructor has ever earned across their published courses, subtracts
// whatever has already been approved/paid out, and returns what's left.
async function calculateBalance(instructorId) {
  const courses = await Course.find({ instructor: instructorId });

  const totalEarned = courses.reduce((sum, course) => {
    const studentsEnrolled = course.studentsEnrolled?.length || 0;
    return sum + studentsEnrolled * (course.price || 0);
  }, 0);

  const withdrawals = await Withdrawal.find({ instructor: instructorId }).sort({
    createdAt: -1,
  });

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "Approved" || w.status === "Paid")
    .reduce((sum, w) => sum + w.amount, 0);

  // Money that's already requested but not yet resolved shouldn't be
  // available to request again.
  const totalPending = withdrawals
    .filter((w) => w.status === "Pending")
    .reduce((sum, w) => sum + w.amount, 0);

  const availableBalance = Math.max(
    totalEarned - totalWithdrawn - totalPending,
    0
  );

  return { totalEarned, totalWithdrawn, availableBalance, withdrawals };
}

// GET the instructor's balance summary + their full withdrawal history
exports.getWithdrawals = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { totalEarned, totalWithdrawn, availableBalance, withdrawals } =
      await calculateBalance(instructorId);

    return res.status(200).json({
      success: true,
      message: "Withdrawals fetched successfully",
      data: {
        totalEarned,
        totalWithdrawn,
        availableBalance,
        withdrawals,
      },
    });
  } catch (error) {
    console.log("error in getWithdrawals", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST a new withdrawal request against the available balance
exports.requestWithdrawal = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { amount, note = "" } = req.body;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid withdrawal amount",
      });
    }

    const { availableBalance } = await calculateBalance(instructorId);

    if (numericAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal amount exceeds your available balance",
      });
    }

    const withdrawal = await Withdrawal.create({
      instructor: instructorId,
      amount: numericAmount,
      note,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: withdrawal,
    });
  } catch (error) {
    console.log("error in requestWithdrawal", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
