const Profile=require('../models/Profile')
const User=require('../models/User')

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

exports.updateDisplayPicture = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "updateDisplayPicture is not implemented yet.",
  });
};

exports.getEnrolledCourses = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "getEnrolledCourses is not implemented yet.",
  });
};

exports.instructorDashboard = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "instructorDashboard is not implemented yet.",
  });
};