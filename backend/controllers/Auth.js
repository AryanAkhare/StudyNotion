const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile=require("../models/Profile")
const bcrypt=require('bcrypt')
const otpGenerator =require("otp-generator");
const jwt=require("jsonwebtoken");
require("dotenv").config()

//sendOTP
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // generate unique OTP
    let otp;
    let otpExists = true;

    // Generates a new OTP

    // Checks DB if that OTP already exists

    // If it exists → loop again

    // If it doesn’t → loop exits

    // Ensures uniqueness among active (non-expir
    while (otpExists) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      otpExists = await OTP.findOne({ otp });
    }

    // save OTP in DB
    await OTP.create({
      email,
      otp,
      createdAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
    });
  }
};

//signup
exports.signUp = async (req, res) => {
  try {
    //data fetch
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //valiate body
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are mandatory for signup."
        })
    }

    //2 password match

    if(password!=confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and confirmPassword doesn’t match try again."

        })
    }


    //check user exist
    const exisitngUser=await User.findOne({email});
    if(exisitngUser){
        return res.status(500).json({
            success:false,
            message:"User already exist."
        })
    }

    //find most recent otp stored for user

    const recentOtp=await OTP.find({email}).sort({
        createdAt:-1
    }).limit(1)

//     It fetches the latest OTP created for that email.

// sort({ createdAt: -1 }) orders newest first, and limit(1) picks the most recent one.
//.sort({ createdAt: 1 }) oldest otp first

    //validate otp

    if(recentOtp.length==0){
        //OTP not found
        return res.status(400).json({
            success:false,
            message:"OTP not found."
        })
    }else if(otp!=recentOtp){
        //invalid OTP
        return res.status(400).json({
            success:false,
            message:"OTP invalid."
        })
    }

    //hash password

    const hashedPassword=await bcrypt.hash(password,10);

    //entry created in DB
    const profileDetails=await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null
    })
    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        accountType,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}%20${lastName}`

    })

    


    //return res
    return res.status(200).json({
        success:true,
        message:'User is registered successfully.',
        user
    })
  } catch (error) {
    return res.status(200).json({
        success:false,
        message:`User is registeration failed : ${error}`,
        
    })
  }
};
//login
exports.login=async(req,res)=>{
    try{
        //get data from req body
        const {email,password}=req.body;
        //validation
        //valiate body
        if(!email || !password ){
        return res.status(403).json({
            success:false,
            message:"All fields are mandatory for login."
        })
        }

        //user check exists or not
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.json(401).json({
                success:false,
                message:'User is not registered , please signUp first.'
            })
        }
        //generate jwt,after pass check
        if(await bcrypt.compare(password,user.password)){
            const  payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType,

            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            })
            user.token=token;
            user.password=undefined;

        //create cookie and send response
        const options={
            expiresIn:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true
        }
        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
        })
    
        }else{
            return res.json(401).json({
                success:false,
                message:'Password is incorrect.'
            })
        }
        
        
    }
    catch(error){
        return res.json(500).json({
                success:false,
                message:`Login failure , Please try again.`
        })
    }
}

//changePassword
exports.changePassword=async(req,res)=>{
    //get data from body
    //get oldpass , newpass , confirmnew
    //validation
    //update password in db
    //send mail pass generated
    //return res
}
