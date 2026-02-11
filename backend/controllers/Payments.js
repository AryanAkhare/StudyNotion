const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = "../mail/templates/courseEnrollmentEmail.js";

//capture payment and initiate orders
exports.capturePayment = async (req, res) => {
  //get courseId and userid
  const { course_id } = req.body;
  const userId = req.user.id;

  //validate
  if (!course_id) {
    return res.json({
      success: false,
      message: "Please provide valid course Id.",
    });
  }
  //valid courseDetail
  let course;
  try {
    course = await Course.findById({ course_id });
    if (!course) {
      return res.json({
        success: false,
        message: "Coudnt find the course.",
      });
    }

    //user alrady paid

    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.json({
        success: false,
        message: "Student already enrolled.",
      });
    }

    //create order
    const amount = course.price;
    const currency = "INR";
    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: course_id,
        userId,
      },
    };
    //initiate
    try {
      //initiate using razorpay
      const paymentResponse = await instance.orders.create(options);
      // instance.orders.create({
      //   amount: 50000,
      //   currency: "<currency>",
      //   receipt: "receipt#1",
      //   notes: {
      //     key1: "value3",
      //     key2: "value2"
      //   }
      // })
      console.log(paymentResponse);

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
      return res.json({
        success: false,
        message: "Coudnt initiate order" + error,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Capturing payment failed." + error,
    });
  }
};

const crypto = require("crypto");

exports.verifySignature = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== signature) {
    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }

  console.log("PAYMENT AUTHORIZED");

  try {
    const { courseId, userId } =
      req.body.payload.payment.entity.notes;

    // Enroll student in course
    const enrolledCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    // Add course to student
    const enrolledStudent = await User.findByIdAndUpdate(
      userId,
      { $push: { courses: courseId } },
      { new: true }
    );

    // Send mail
    await mailSender(
      enrolledStudent.email,
      "Congratulations from CodeHelp",
      "You have successfully enrolled in the course."
    );

    return res.status(200).json({
      success: true,
      message: "Signature verified and course added.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Capturing payment failed",
      error: error.message,
    });
  }
};

