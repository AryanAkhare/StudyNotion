const crypto = require("crypto");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { resetPasswordEmail } = require("../mail/templates/resetPasswordEmail");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const email = req.body.email;

    //check user for this email , email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesnt exist.",
      });
    }
    //generate token
    const token = crypto.randomUUID();

    //update user by adding token and expiration time
    await User.findOneAndUpdate(
      { email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true },
    );

    //create url
    const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/update-password/${token}`;
    const body = resetPasswordEmail(url);
    //send mail containing the url
    await mailSender(email, "Password Reset Link", body);
    // return response

    return res.status(200).json({
      success: true,
      message: "Email send successfully, Please check email and changePassword",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password.",
      error: err.message,
    });
  }
};

//resetPassword

exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    if (!password || !confirmPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "password, confirmPassword and token are required.",
      });
    }
    //validate
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password not matching.",
      });
    }
    //User entry update passwrord update using token
    //if no entry invalid token
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token invalid.",
      });
    }
    
    //if token time expired already
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired while resetting.",
      });
    }

    //password hashedPassword
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    await User.findOneAndUpdate({
      token: token,
    }, {
      password: hashedPassword,
      token: undefined,
      resetPasswordExpires: undefined,
    }, { new: true });
    //response
    return res.status(200).json({
      success: true,
      message: "Resetting password successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password.",
      error: error.message,
    });
  }
};
