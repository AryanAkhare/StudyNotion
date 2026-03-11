const Profile = require('../models/Profile')
const User = require('../models/User')
const Course = require('../models/Course')

exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    const id = req.user && req.user.id;

    if (!gender || !contactNumber || !id) {
      return res.status(400).json({
        success: false,
        message: "gender, contactNumber and user id are required for updating profile.",
      });
    }

    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};


exports.deleteAccount=async (req,res)=>{
    try{

        //get id
        const id=req.user.id;
        //validate
        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
            success:false,
            message:'User not found for deletion.'
        })
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})

        //enrolled account se bhi delete hojaye
        //how can we schdeule this operation

        //delete user

        await User.findByIdAndDelete({_id:id})

        
        //return res
        return res.status(200).json({
            success:true,
            message:"Account deleted successfully."
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user && req.user.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account fetched successfully.",
      user: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details.",
      error: error.message,
    });
  }
};

const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.updateDisplayPicture = async (req, res) => {
  try {
    const userId = req.user?.id;
    const file = req.files?.displayPicture;

    if (!userId || !file) {
      return res.status(400).json({
        success: false,
        message: "user id and displayPicture file are required.",
      });
    }

    const uploadResult = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: uploadResult.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Display picture updated successfully.",
      imageUrl: updatedUser.image,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update display picture.",
      error: err.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const user = await User.findById(userId).populate({
      path: "courses",
      populate: [
        { path: "instructor", select: "firstName lastName" },
        { path: "category" },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrolled courses fetched successfully.",
      courses: user.courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses.",
      error: err.message,
    });
  }
};

exports.instructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const instructorCourses = await Course.find({ instructor: instructorId })
      .populate("studentsEnrolled")
      .exec();

    const totalCourses = instructorCourses.length;
    const totalStudents = instructorCourses.reduce(
      (sum, course) => sum + (course.studentsEnrolled?.length || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      message: "Instructor dashboard data fetched successfully.",
      data: {
        totalCourses,
        totalStudents,
        courses: instructorCourses,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor dashboard.",
      error: err.message,
    });
  }
};