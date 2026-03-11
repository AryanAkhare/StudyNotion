exports.verificationEmail = (otp) => {
  return `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Verify your email</h2>
      <p>Your OTP for StudyNotion is:</p>
      <p style="font-size: 24px; font-weight: bold;">${otp}</p>
      <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
      <p style="margin-top:16px;">Thanks,<br/>StudyNotion Team</p>
    </div>
  `;
};

