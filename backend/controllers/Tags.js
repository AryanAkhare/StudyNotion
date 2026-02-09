const Tag=require('../model/tags');

//create Tab handler function

exports.createTag=async (req,res)=>{
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
        const tagDetails=await Tag.create({
            name:name,
            description:description
        });
        console.log(tagDetails);

        //resturn response
        return res.status(200).json({
            success:true,
            message:'Tag created.'
        })



    }catch(err){
        return res.status(500).json()({
            success:failure,
            message:err.message
        })
    }
}

exports.showAlltags=async (req,res)=>{
    try{
        const allTags=await Tag.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:'Returned all tags successfully.',
            allTags
        })

    }catch(err){
        return res.status(500).json()({
            success:failure,
            message:err.message
        })
    }
}