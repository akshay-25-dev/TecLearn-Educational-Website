const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress")

const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
// Helper utility to convert total duration in seconds to formatted string (e.g. 2h 15m)
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    // fetch data from request body
    const { 
      firstName,
      lastName,
      dateOfBirth = "",
      about = "",
      contactNumber="",
      gender="" ,
    } = req.body

    // fetch user id
    const id = req.user.id
    
    // find user & update names if provided
    const userDetails = await User.findById(id);
    if (firstName) userDetails.firstName = firstName;
    if (lastName) userDetails.lastName = lastName;
    await userDetails.save();

    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    
    // update profile fields
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;

    // save updated profile
    await profileDetails.save();
    
    // Fetch updated user details with populated additionalDetails for frontend state (SettingsAPI.js expects updatedUserDetails)
    const updatedUserDetails = await User.findById(id).populate("additionalDetails");
    
    return res.json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
      updatedUserDetails,
    })
  } catch (error) {
    console.log("error in update profile", error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    // GET ID
    const id = req.user.id
    // validation
    const userDetails = await User.findById({ _id: id })
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({_id : userDetails.additionalDetails});
    // unenroll users from all enroleed courses
    for (const courseId of userDetails.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    // return response
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    //get user id 
    const id = req.user.id
    // validate and fetch user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    // return response
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

///// new controllers

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      90
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    console.error("❌ updateDisplayPicture error:", error)
    return res.status(500).json({
      success: false,
      message: error.message,
      detail: error.http_code || error.error || error.stack?.split("\n")[0],
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ------------------------------------------------------------------
// Wishlist
// ------------------------------------------------------------------

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id
    const userDetails = await User.findById(userId)
      .populate({
        path: "wishlist",
        populate: { path: "instructor", select: "firstName lastName" },
      })
      .exec()

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: userDetails.wishlist,
    })
  } catch (error) {
    console.log("error in getWishlist", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: courseId } },
      { new: true }
    ).populate("wishlist")

    return res.status(200).json({
      success: true,
      message: "Course added to wishlist",
      data: updatedUser.wishlist,
    })
  } catch (error) {
    console.log("error in addToWishlist", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: courseId } },
      { new: true }
    ).populate("wishlist")

    return res.status(200).json({
      success: true,
      message: "Course removed from wishlist",
      data: updatedUser.wishlist,
    })
  } catch (error) {
    console.log("error in removeFromWishlist", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      // Fix typo: studentsEnroled -> studentsEnrolled (from Course model schema)
      const totalStudentsEnrolled = course.studentsEnrolled?.length || 0
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        courseThumbnail: course.thumbnail,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}
