const mongoose = require("mongoose");
const crypto = require("crypto");

const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");

// capture payment and initiate order (supports card/UPI via Razorpay)
exports.capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user && req.user.id;

    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "courseId and authenticated user are required.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(409).json({
        success: false,
        message: "Student already enrolled in this course.",
      });
    }

    const amount = course.price;
    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency,
      receipt: `${Date.now()}`,
      notes: {
        courseId,
        userId,
      },
    };

    const paymentResponse = await instance.orders.create(options);

    return res.status(200).json({
      success: true,
      message: "Payment order created successfully.",
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to capture payment.",
      error: error.message,
    });
  }
};

// webhook handler to verify Razorpay signature and enroll student
exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { studentsEnrolled: userId } },
      { new: true },
    );

    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { courses: courseId } },
      { new: true },
    );

    if (!enrolledCourse || !enrolledStudent) {
      return res.status(400).json({
        success: false,
        message: "Failed to enroll student after payment.",
      });
    }

    await mailSender(
      enrolledStudent.email,
      "Congratulations from StudyNotion",
      "You have successfully enrolled in the course.",
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and course enrollment completed.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while verifying payment signature.",
      error: error.message,
    });
  }
};

// alias used by existing routes
exports.verifyPayment = exports.verifySignature;

// optional explicit success email handler (idempotent)
exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { email, courseName } = req.body;

    if (!email || !courseName) {
      return res.status(400).json({
        success: false,
        message: "email and courseName are required.",
      });
    }

    await mailSender(
      email,
      "Payment successful",
      `You have successfully enrolled in ${courseName}.`,
    );

    return res.status(200).json({
      success: true,
      message: "Payment success email sent.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send payment success email.",
      error: error.message,
    });
  }
};

