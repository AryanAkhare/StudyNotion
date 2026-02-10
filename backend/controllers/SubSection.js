const SubSection=require('../models/SubSection')
const Section=require('../models/Section')

exports.createSubSection=async(req,res)=>{
    try{
        //fetch data
        //extract file/video

        //runValidators
        //upload video to cloudinary
        //create subSection
    }catch(err){
        return res.status(500).json()({
            success:failure,
            message:err.message
        })
    }
}