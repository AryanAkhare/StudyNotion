# Backend Development Log

## 1. 2026-02-03 — Code Flow & What Was Added Today

Entry point:
- backend/index.js boots the Express app, loads configuration, connects to the database, and registers routes and middleware.

Database connection:
- config/database.js initializes the DB client (Mongoose or equivalent) and exports the shared connection.

Models (core):
- User.js: stores user credentials, auth tokens, and profile references.
- OTP.js: stores one-time codes and metadata. A pre-save hook now triggers email sending when an OTP is created.
- Profile.js: extended user profile information.
- Course.js, Section.js, SubSection.js: course structure and content documents.
- CourseProgress.js: user's progress tracking for course content.
- Invoices.js: payment and receipt records.
- RatingAndReview.js: course ratings and reviews.
- tags.js: tagging and search metadata for courses.

Utilities:
- utils/mailSender.js: centralized email helper (uses Nodemailer or similar) to compose and send emails such as OTPs and notifications.

Controllers:
- controllers/Auth.js: signup, login, token issuance, and auth-related endpoints.
- controllers/ResetPassword.js: generates OTPs for password resets, verifies them, and updates user passwords.

Middleware:
- middlewares/auth.js: protects routes by verifying JWT/session and attaching user info to requests.

Routes:
- /routes maps HTTP endpoints to controller actions (auth, reset-password, courses, profile, etc.).

Today's implemented behavior (summary):
- Models created/updated for users, courses, progress, and related data.
- utils/mailSender.js implemented to send emails.
- OTP model has a pre-save hook that invokes mailSender so an email is automatically sent whenever a new OTP is created (e.g., during password-reset requests).

Typical runtime sequence (how it works now):
1. Client requests a password reset via the endpoint handled in ResetPassword.js.
2. The controller creates and saves an OTP document.
3. The OTP model's pre-save hook calls utils/mailSender.js to email the OTP to the user.
4. The user submits the OTP to a verification endpoint; the controller validates it against OTP records.
5. On successful validation, the controller updates the User password.
6. Protected endpoints rely on middlewares/auth.js for access control.

What the code shows today (concise):
- A backend implementing authentication and password-reset flows, course/content data models, and automated OTP emailing on OTP creation.

## 2. 2026-02-04 — Code Flow & What Was Added Today

Controllers:
- Auth.js:
  - sendOTP: handles OTP generation for signup. Validates email, checks if user already exists, generates a unique 6-digit OTP, stores it in the OTP collection, and relies on TTL in the OTP model to auto-expire it after 5 minutes.
  - signup: validates request data, checks password match, verifies user existence, fetches the most recent OTP, validates it, hashes the password, creates a Profile document, and creates a new User with default avatar.
  - login: validates credentials, checks user existence, compares hashed passwords, generates JWT with role info, stores token, and sends it via secure HTTP-only cookie.
  - changePassword: controller structure added (logic to be implemented).

- ResetPassword.js:
  - resetPasswordToken: validates email, checks user existence, generates a secure reset token, updates the User with token and expiration time, creates a password-reset URL, and sends it via email.
  - resetPassword: validates passwords, verifies reset token, checks token expiry, hashes the new password, updates the User password, and returns success response.

Middleware:
- auth.js: verifies JWT from cookies/body/headers and attaches decoded user info to the request.
- isStudent, isAdmin, isInstructor: role-based access control for protected routes.

Models:
- User.js: extended with `token` and `resetPasswordExpires` fields to support password reset functionality.
- OTP.js: stores OTP values with email reference and TTL expiry; pre-save hook sends OTP email automatically.
- Profile.js: stores extended user profile details.

Utilities:
- utils/mailSender.js: reused for OTP delivery and password reset emails.

Current Behavior:
- OTPs are auto-deleted after expiry using TTL.
- Signup and login flows are fully connected with OTP verification and JWT-based authentication.
- Password reset flow is functional using token-based verification and expiry checks.
