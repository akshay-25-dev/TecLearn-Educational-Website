const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/auth")
const {
  deleteAccount, 
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture, 
  getEnrolledCourses,
  instructorDashboard,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

// Wishlist
router.get("/getWishlist", auth, getWishlist)
router.post("/addToWishlist", auth, addToWishlist)
router.post("/removeFromWishlist", auth, removeFromWishlist)

module.exports = router
