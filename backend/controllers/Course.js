const Course = require("../models/Course");
const Tag = require("../models/Category");
const User = require("..models/User");

exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(500).json({
        success: false,
        message: "All fields are required for course creation.",
      });
    }

    //check instructor
    const userId = req.User._id; //VERIFY USER AND instructor ID different
    const instructorDetails = await User.findById(userId);
    console.log("instructor details:", instructorDetails);

    if (!instructorDetails) {
      return res.status(500).json({
        success: false,
        message: "instructor details not found.",
      });
    }

    //check given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(500).json({
        success: false,
        message: "Tag details details not found.",
      });
    }

    //upload to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME,
    );

    //create entry for newCourse
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add new course to user schema of instructor
    await User.findByIdAndUpdate(
      instructorDetails._id,
      {
        $push: {
          courses: newCourse._id,
        },
      },
      {
        new: true,
      },
    );
    //update tag schema
    await Tag.findByIdAndUpdate(
      tagDetails._id,
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true },
    );


    //return response
    return res.status(200).json({
        success:true,
        message:"Course Created Successfully",
        data:newCourse
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:'Failed to create course. '+ err.message,
    });
  }
};



exports.showAllCourses=async(req,res)=>{
    try{
        const allCourses=await Course.find({},{
            courseName:true,
            courseDescription:true,
            price:true,
            instructor:true,
            thumbnail:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
            
        }).populate("instructor").exec()

        return res.status(200).json({
            success: false,
        message:'Fetched all courses data.'
      ,allCourses
        })
    }
    catch (err) {
    return res.status(500).json({
      success: false,
      message:'Cannot fetch course data'
      ,
      error:err.message
    });
}}


exports.getCourseDetails=async(req,res)=>{
  try{
    //get id
    const {course_id}=req.body;
    //find course details
    const courseDetails=await Course.find({
      _id:course_id
    }).populate({
        path:"instructor",populate:{
          path:"additionalDetails"
        }
    }).populate("category").populate("ratingAndReviews").path({
      path:"courseContent",populate:{
        path:"subSection"
      }
    }).exec();

    if(!courseDetails){
      return res.status(500).json({
      success: false,
      message:'Couldnt find the course with courseId'
    });
    }

    return res.status(200).json({
      success:true,
      message:"Course details fetched successfully.",
      data:courseDetails
    })
  }catch(err){
    return res.status(500).json({
      success: false,
      message:'Cannot fetch course details.'
      ,
      error:err.message
    });
  }
}