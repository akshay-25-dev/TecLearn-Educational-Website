const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/auth")
const {
  getWithdrawals,
  requestWithdrawal,
} = require("../controllers/Withdrawal")

// ********************************************************************************************************
//                                      Withdrawal routes (Instructor only)
// ********************************************************************************************************
router.get("/getWithdrawals", auth, isInstructor, getWithdrawals)
router.post("/requestWithdrawal", auth, isInstructor, requestWithdrawal)

module.exports = router
