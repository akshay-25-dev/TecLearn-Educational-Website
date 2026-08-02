// Import the required modules
const express = require("express")
const router = express.Router()
const {
  capturePayment,
  verifyPayment,
  getPurchaseHistory,
  sendPaymentSuccessEmail,
} = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment", auth, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail)
// router.post("/verifySignature", verifySignature)
router.get("/getPurchaseHistory", auth, isStudent, getPurchaseHistory)

module.exports = router
