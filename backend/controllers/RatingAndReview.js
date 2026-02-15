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
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Course ID",
      });
    }

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating = result[0]?.avgRating
      ? Number(result[0].avgRating.toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      averageRating,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch average rating",
      error: error.message,
    });
  }
};

//getAll
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({ path: "user", select: "firstName lastName email image" })
      .populate({path: "course",select:"courseName"}).exec()

    return res.status(200).json({
        success:true,
        message:"All reviews fetched successfully",
        allReviews
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all rating",
      error: error.message,
    });
  }
};
