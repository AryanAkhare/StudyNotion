//Protected routes
const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require("../models/User");
//auth
exports.auth = async (req, res, next) => {
  try {
    // get token from cookie, body, or standard Authorization header
    const authHeader = req.header("Authorization") || req.header("authorization");
    let token = req.cookies?.token || req.body?.token || null;

    if (!token && authHeader) {
      token = authHeader.replace(/^Bearer\s+/i, "").trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing.",
      });
    }
    //verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid.",
      });
      
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating token.",
    });
  }
};

//isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success: false,
                message: "Protected route for Students only.",
            })
        }
    }
    catch(err){
        return res.status(401).json({
      success: false,
      message: "User role cannot be verified , please try again.",
    });
    }
}
//isAdmin
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success: false,
                message: "Protected route for Admins only.",
            })
        }
    }
    catch(err){
        return res.status(401).json({
      success: false,
      message: "User role cannot be verified , please try again.",
    });
    }
}
//isInstructor
exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
                success: false,
                message: "Protected route for Instructors only.",
            })
        }
    }
    catch(err){
        return res.status(401).json({
      success: false,
      message: "User role cannot be verified , please try again.",
    });
    }
}
