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

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId, title, timeDuration, description, additionalUrl } = req.body;
    const video = req.files?.videoFile;

    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "subSectionId is required.",
      });
    }

    const updatePayload = {};
    if (title) updatePayload.title = title;
    if (timeDuration) updatePayload.timeDuration = timeDuration;
    if (description) updatePayload.description = description;
    if (additionalUrl) updatePayload.additionalUrl = additionalUrl;

    if (video) {
      const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
      updatePayload.videoUrl = uploadDetails.secure_url;
    }

    const updatedSubSection = await SubSection.findByIdAndUpdate(subSectionId, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updatedSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully.",
      updatedSubSection,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update SubSection.",
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

// NOTE: duplicate deleteSubSection removed
