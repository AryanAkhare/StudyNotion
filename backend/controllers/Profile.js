const Profile=require('../models/Profile')
const User=require('../models/User')

exports.updateProfile=async (req,res)=>{
    try{
        //get data
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;
        const id=req.user.id;
        //get userID
        //validate
        if(!gender||!contactNumber || !id){
            return res.status(500).json({
            success:true,
            message:"All fields required for updating profile."
        })
        }


        //find Profile
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);
        //update Profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();

        return res.status(500).json({
            success:true,
            message:"Profile updated successfully"
        })
        //return res
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


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

exports.getAllUserDetails=async(req,res)=>{
    try{
        //get id
        const id=req.user.id;
        //validate
        // 
        const userDetails=await User.findById(id).populate("additionalDetails").exec()

        //return res
        return res.status(200).json({
            success:true,
            message:"Account Fetched successfully."
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}