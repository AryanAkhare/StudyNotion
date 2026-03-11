exports.resetPasswordEmail = (resetUrl) => {
  return `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your StudyNotion password.</p>
      <p>Click the link below to set a new password (valid for 5 minutes):</p>
      <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p style="margin-top:16px;">Regards,<br/>StudyNotion Team</p>
    </div>
  `;
};

