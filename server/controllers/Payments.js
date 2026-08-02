const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const Payment = require("../models/Payment");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const crypto = require("crypto")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  // get course id and user id from request body
  const { course_id } = req.body;
  const userId = req.user.id;
  // validate course id
  if (!course_id) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }
  /// validate course details
  let course;
  try {
    // Find the course by its ID
    course = await Course.findById(course_id);

    // If the course is not found, return an error
    if (!course) {
      return res
        .status(200)
        .json({ success: false, message: "Could not find the Course" });
    }

    // Check if the user is already enrolled in the course
    const uid = new mongoose.Types.ObjectId(userId); // Convert userId(jo ki string me hai ) to ObjectId
    if (course.studentsEnrolled.includes(uid)) {
      return res
        .status(200)
        .json({ success: false, message: "Student is already Enrolled" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }

  // create order
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency: currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    // return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate order.",
    });
  }
};

// verify the payment - client-side verification
// The frontend sends razorpay_order_id, razorpay_payment_id, razorpay_signature
// We verify using HMAC-SHA256 with our RAZORPAY_SECRET
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course_id } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment details are incomplete",
    });
  }

  // Verify signature: HMAC SHA256 of order_id|payment_id using RAZORPAY_SECRET
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }

  // Payment is verified — enroll student
  try {
    // Get userId from the auth middleware or from the order notes
    // Since verifyPayment might not have auth, we look up the order
    const userId = req.user?.id || (await instance.orders.fetch(razorpay_order_id)).notes.userId;
    const courseId = course_id;

    // Enroll student in the course
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      return res.status(500).json({
        success: false,
        message: "Course not Found",
      });
    }

    // Add course to student's enrolled courses
    const enrolledStudent = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { courses: courseId } },
      { new: true }
    );

    // Create course progress for the student
    try {
      await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });
    } catch (progressError) {
      console.log("Could not create course progress:", progressError);
    }

    // Save payment record
    try {
      await Payment.create({
        user: userId,
        courses: [courseId],
        amount: enrolledCourse.price,
        razorpay_order_id,
        razorpay_payment_id,
        status: "Success",
      });
    } catch (paymentLogError) {
      console.log("Could not save purchase history record:", paymentLogError);
    }

    // Send enrollment email
    try {
      await mailSender(
        enrolledStudent.email,
        "Congratulations from TecLearn",
        courseEnrollmentEmail(enrolledCourse.courseName, enrolledStudent.firstName)
      );
    } catch (emailError) {
      console.log("Could not send enrollment email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Payment Verified and Course Enrolled",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send payment success email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the details",
    });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );

    return res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    console.log("Error sending payment success email:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send email",
    });
  }
};

// Get every past purchase made by the logged in student, most recent first
exports.getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const purchases = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "courses",
        select: "courseName thumbnail price",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Purchase history fetched successfully",
      data: purchases,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


