const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

//createRating
exports.createRating = async (req, res) => {
  try {
    //getData
    const userId = req.user.id;
    //fetch
    const { rating, review, courseId } = req.body;
    //check if user exists in enrolled
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentEnrolled: userId,
    });
    if (!courseDetails) {
      return res.status(500).json({
        success: false,
        message: "Student not enrolled.",
      });
    }
    //check if user already revewid
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (!courseDetails) {
      return res.status(500).json({
        success: false,
        message: "Already Reviewed.",
      });
    }
    //create rating
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    //update Course model
    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      {
        new: true,
      },
    );
    //return res
    return res.status(200).json({
      success: true,
      message: "Created review successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
//getAvg
//getAll
