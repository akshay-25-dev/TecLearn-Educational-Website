const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

/// reset password token controller

exports.resetPasswordToken = async (req, res) => {
  try {
    // Get the email from the request body
    const email = req.body.email
    // check user for this email , email validation
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.json({ 
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      })
    }
    // generate token
    const token = crypto.randomUUID();
// update user with token and expiry
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    )
    console.log("DETAILS", updatedDetails)
    
    //create url
    const url = `http://localhost:3000/update-password/${token}`
    
 /// send mail containing the url to the user
    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    )
    /// return response
    res.json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    })
  }
}

// reset password controller

exports.resetPassword = async (req, res) => {
  try {
    // data fetch 
    const { password, confirmPassword, token } = req.body
    // validation
    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
    }

    // find user from db using token
    const userDetails = await User.findOne({ token: token })
    // if no entry invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      })
    }
    // check if token is expired
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      })
    }
    // hash password
    const encryptedPassword = await bcrypt.hash(password, 10)
    // update user password in db
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    )
    // return response
    res.json({
      success: true,
      message: `Password Reset Successful`,
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    })
  }
}
