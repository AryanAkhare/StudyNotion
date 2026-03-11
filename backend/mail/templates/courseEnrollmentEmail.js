exports.courseEnrollmentEmail = (studentName, courseName) => {
  return `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Congratulations, ${studentName || "Learner"}!</h2>
      <p>You have successfully enrolled in <strong>${courseName}</strong> on StudyNotion.</p>
      <p>You can now start learning from your dashboard.</p>
      <p style="margin-top:16px;">Happy learning,<br/>StudyNotion Team</p>
    </div>
  `;
};

