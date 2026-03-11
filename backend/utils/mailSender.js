const nodemailer = require("nodemailer");

const mailSender = async (email, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: "StudyNotion | By Aryan Akhare",
      to: email,
      subject,
      html: body,
    });

    return info;
  } catch (err) {
    console.error("Error sending mail", err);
    throw err;
  }
};

module.exports = mailSender;