const User = require("..models/User");
const mailSender = require("../utils/mailSender");
const bcrypt=require("bcrypt")

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const email = req.body.email;

    //check user for this email , email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesnt exist.",
      });
    }
    //generate token
    const token = crypto.randomUUID;

    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true },
    );

    //create url
    const url = `https://localhost:3000/update-password/${token}`;
    //send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: ${url}`,
    );
    // return response

    return res.status(200).json({
      success: true,
      message: "Email send successfully, Please check email and changePassword",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong while reseting password.",
    });
  }
};

//resetPassword

exports.resetPassword=async(req,res)=>{

    try{
    //data fetch
    const {password,confirmPassword,token}=req.body;
    //validate
    if(password!==confirmPassword){
        return res.status(400).json({
            success:false,
            message:'Password not matching.'
        })
    }
    //User entry update passwrord update using token
    //if no entry invalid token
    const userDetails=await User.findOne({token:token});
    if(!userDetails){
        return res.status(400).json({
            success:false,
            message:'Token invalid.'
        })
    }
    
    //if token time expired already
    if(userDetails.resetPasswordExpires<Date.now()){
        return res.status(400).json({
            success:false,
            message:'Token Expired while reseting.'
        })
    }

    //password hashedPassword
    const hashedPassword=await bcrypt.hash(password,10);

    //update password
    await User.findOneAndUpdate({
        token:token
    },{
        password:hashedPassword
    },{new:true})
    //response
    return res.status(200).json({
            success:true,
            message:'Reseting password successfully.'
        })
    }
    catch(error){
        return res.status(400).json({
      success: false,
      message: "Something went wrong while reseting password.",
    });
    }
}
