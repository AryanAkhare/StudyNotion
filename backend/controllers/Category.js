const mongoose = require("mongoose");

const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "name and description are required.",
      });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists.",
      });
    }

    const categoryDetails = await Category.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: categoryDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create category.",
      error: err.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true },
    );

    return res.status(200).json({
      success: true,
      message: "Returned all categories successfully.",
      categories: allCategories,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
      error: err.message,
    });
  }
};

// categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Valid categoryId is required.",
      });
    }

    const selectedCategory = await Category.findById(categoryId)
      .populate("course")
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const differentCategories = await Category.find({
      _id: { $ne: new mongoose.Types.ObjectId(categoryId) },
    })
      .populate("course")
      .exec();

    const topSellingCourses = await Course.find({})
      .sort({ totalStudentsEnrolled: -1 })
      .limit(5)
      .exec();

    return res.status(200).json({
      success: true,
      selectedCategory,
      differentCategories,
      topSellingCourses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category page details.",
      error: err.message,
    });
  }
};
