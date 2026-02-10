const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
  try {
    // fetch data
    const { sectionId, title, timeDuration, description } = req.body;

    // fetch video
    const video = req.files?.videoFile;

    // validation
    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required for SubSection",
      });
    }

    // upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create subsection
    const subSectionDetails = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadDetails.secure_url,
    });

    // update section with subsection id
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");

    // return response
    return res.status(201).json({
      success: true,
      message: "SubSection created successfully",
      updatedSection,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "SubSection creation failed",
      error: err.message,
    });
  }
};



exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "subSectionId and sectionId are required",
      });
    }

    // remove subsection reference from section
    await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: { subSection: subSectionId },
      }
    );

    // delete subsection
    await SubSection.findByIdAndDelete(subSectionId);

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "SubSection deletion failed",
      error: err.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "subSectionId and sectionId are required",
      });
    }

    // remove subsection reference from section
    await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: { subSection: subSectionId },
      }
    );

    // delete subsection
    await SubSection.findByIdAndDelete(subSectionId);

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "SubSection deletion failed",
      error: err.message,
    });
  }
};
