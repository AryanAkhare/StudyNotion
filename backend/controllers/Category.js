const Category=require('../model/Categorys');

//create Tab handler function

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