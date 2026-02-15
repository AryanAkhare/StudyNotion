const Category=require('../model/Categorys');




exports.createCategory=async (req,res)=>{
    try{
       const {name,description}=req.body;
       //validation
        if(!name || !description){
            return res.status(500).json()({
            success:failure,
            message:'All fields are required.'
        })
        }
        //create db entry
        const CreatorDetails=await Category.create({
            name:name,
            description:description
        });
        console.log(CategoryDetails);

        //resturn response
        return res.status(200).json({
            success:true,
            message:'Category created.'
        })



    }catch(err){
        return res.status(500).json()({
            success:failure,
            message:err.message
        })
    }
}

exports.showAllCategories=async (req,res)=>{
    try{
        const allCategorys=await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:'Returned all Categorys successfully.',
            allCategorys
        })

    }catch(err){
        return res.status(500).json()({
            success:failure,
            message:err.message
        })
    }
}

//categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
  try {
    // get CategoryId
    const { categoryId } = req.body;

    // get selected category courses
    const selectedCategory = await Category.findById(categoryId)
      .populate("course")
      .exec();

    // validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // get courses from different categories (not equal to current one)
    const differentCategories = await Category.find({
      _id: { $ne: new mongoose.Types.ObjectId(categoryId) },
    })
      .populate("course")
      .exec();

    // TODO: top selling courses logic here
    const topSellingCourses = await Course.find({})
    .sort({ totalStudentsEnrolled: -1 })
    .limit(5)
    .exec();


    return res.status(200).json({
      success: true,
      selectedCategory,
      differentCategories,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
