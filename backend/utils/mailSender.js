const nodemailer=require("nodemailer");
const mailSender=async (email,type,body)=>{
    try{

        let transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                password:process.env.MAIL_PASSWORD
            }


        })

        let info=await transporter.sendMail({
            from:"StudyNotion || By Aryan Akhare",
            to: `${email}` ,
            subject : `${title}`,
            html:`${body}`
        })
        console.log(info)
        return info;

    }catch(err){
        console.error(err)
    }
}
module.exports =mailSender;