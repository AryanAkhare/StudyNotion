const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      categoryId,
    } = req.body;

    //get thumbnail
    const thumbnail = req.files && req.files.thumbnailImage;
    const category = categoryId || tag;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required for course creation.",
      });
    }

    //check instructor
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const instructorDetails = await User.findById(userId);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "instructor details not found.",
      });
    }

    //check given category is valid or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
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
      category: categoryDetails._id,
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
    //update category schema
    await Category.findByIdAndUpdate(
      categoryDetails._id,
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true },
    );


    //return response
    return res.status(201).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create course. " + err.message,
    });
  }
};



exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        courseDescription: true,
        price: true,
        instructor: true,
        thumbnail: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      },
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Fetched all courses data.",
      allCourses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Cannot fetch course data.",
      error: err.message,
    });
  }
};

// alias for older name
exports.showAllCourses = exports.getAllCourses;


exports.getCourseDetails = async (req, res) => {
  try {
    const { course_id, courseId } = req.body;
    const id = courseId || course_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "courseId is required.",
      });
    }

    const courseDetails = await Course.findById(id)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .exec();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Could not find the course with the given courseId.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully.",
      data: courseDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Cannot fetch course details.",
      error: err.message,
    });
  }
};

exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId, course_id } = req.body;
    const id = courseId || course_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "courseId is required.",
      });
    }

    const courseDetails = await Course.findById(id)
      .populate({ path: "instructor", populate: { path: "additionalDetails" } })
      .populate("category")
      .populate({ path: "courseContent", populate: { path: "subSection" } })
      .populate({ path: "ratingAndReviews", populate: { path: "user", select: "firstName lastName" } })
      .exec();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Full course details fetched successfully.",
      data: courseDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Cannot fetch full course details.",
      error: err.message,
    });
  }
};

exports.editCourse = async (req, res) => {
  try {
    const instructorId = req.user?.id;
    const { courseId, course_id, courseName, courseDescription, whatYouWillLearn, price, categoryId, status, instructions, tag } = req.body;
    const id = courseId || course_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "courseId is required.",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    if (String(course.instructor) !== String(instructorId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this course.",
      });
    }

    const updatePayload = {};
    if (courseName) updatePayload.courseName = courseName;
    if (courseDescription) updatePayload.courseDescription = courseDescription;
    if (whatYouWillLearn) updatePayload.whatYouWillLearn = whatYouWillLearn;
    if (typeof price !== "undefined") updatePayload.price = price;
    if (categoryId) updatePayload.category = categoryId;
    if (status) updatePayload.status = status;
    if (instructions) updatePayload.instructions = instructions;
    if (tag) updatePayload.tag = tag;

    const updatedCourse = await Course.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      data: updatedCourse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to edit course.",
      error: err.message,
    });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const instructorCourses = await Course.find({ instructor: instructorId })
      .populate("category")
      .populate("courseContent")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Instructor courses fetched successfully.",
      courses: instructorCourses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses.",
      error: err.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const instructorId = req.user?.id;
    const { courseId, course_id } = req.body;
    const id = courseId || course_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "courseId is required.",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    if (String(course.instructor) !== String(instructorId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this course.",
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete course.",
      error: err.message,
    });
  }
};