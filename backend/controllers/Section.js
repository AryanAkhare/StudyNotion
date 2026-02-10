const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "sectionName and courseId are required",
      });
    }

    const newSection = await Section.create({ sectionName });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { courseContent: newSection._id },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Section creation failed",
      error: error.message,
    });
  }
};


exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "sectionName and sectionId are required",
      });
    }

    const updatedSectionDetails = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      updatedSectionDetails,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Section update failed",
      error: error.message,
    });
  }
};


exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "sectionId and courseId are required",
      });
    }

    // remove section reference from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: { courseContent: sectionId },
    });

    // delete section
    await Section.findByIdAndDelete(sectionId);
    //TODO :- do we need to remove from courseScehma too?
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Section deletion failed",
      error: error.message,
    });
  }
};
