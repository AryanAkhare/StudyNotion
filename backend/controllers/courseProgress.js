const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");

exports.updateCourseProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId, subSectionId } = req.body;

    if (!userId || !courseId || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "userId, courseId and subSectionId are required.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let progress = await CourseProgress.findOne({ courseId });
    if (!progress) {
      progress = await CourseProgress.create({ courseId, completedVideos: [subSectionId] });
      user.courseProgess = user.courseProgess || [];
      if (!user.courseProgess.includes(progress._id)) {
        user.courseProgess.push(progress._id);
        await user.save();
      }
    } else {
      if (!progress.completedVideos.includes(subSectionId)) {
        progress.completedVideos.push(subSectionId);
        await progress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Course progress updated successfully.",
      progress,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update course progress.",
      error: err.message,
    });
  }
};

