const mongoose=require("mongoose");
const mailSender=require("mailSender")




const OTPSchema=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now(),
        expires:5*60 //5 mins
    }
})


// Pre/post middlware
// User --> data enter --> otp-mail --> otp enter --> submit  --> db enter create (pre-save middlware)
// so otp model have mailsend nodemailer code

//function to send mail pre-middleware
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"Verification Email for StudyNest",otp);
        console.log("Email sent successfully.",mailResponse)

    }catch(error){
        console.log("Error while sending mail.",error)
        throw error;
    }
}
OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})
module.exports=mongoose.model("OTP",OTPSchema);