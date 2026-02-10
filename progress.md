# Backend Development Log

---

## 1. 2026-02-03 — Code Flow & What Was Added Today

### Entry Point
- `backend/index.js` boots the Express application, loads configuration, connects to the database, and registers routes and middleware.

### Database Connection
- `config/database.js` initializes the database client (Mongoose or equivalent) and exports a shared database connection.

### Models (Core)
- **User.js**: Stores user credentials, authentication tokens, roles, and profile references.
- **OTP.js**: Stores one-time codes and related metadata. Includes a pre-save hook to trigger email sending when an OTP is created.
- **Profile.js**: Stores extended user profile information.
- **Course.js**: Represents course metadata and structure.
- **Section.js**: Defines sections within a course.
- **SubSection.js**: Stores individual lessons or content units.
- **CourseProgress.js**: Tracks user progress through course content.
- **Invoices.js**: Manages payment and receipt records.
- **RatingAndReview.js**: Stores course ratings and user reviews.
- **tags.js**: Stores tagging and search metadata for courses.

### Utilities
- **utils/mailSender.js**: Centralized email helper (using Nodemailer or similar) for sending OTPs and system notifications.

### Controllers
- **controllers/Auth.js**: Handles signup, login, token issuance, and authentication-related endpoints.
- **controllers/ResetPassword.js**: Generates OTPs for password resets, verifies them, and updates user passwords.

### Middleware
- **middlewares/auth.js**: Protects routes by verifying JWT or session tokens and attaching user information to requests.

### Routes
- `/routes` maps HTTP endpoints to controller actions (authentication, password reset, courses, profile, etc.).

### Today’s Implemented Behavior
- Models created or updated for users, courses, progress tracking, and related data.
- `utils/mailSender.js` implemented for sending emails.
- OTP model enhanced with a pre-save hook to automatically send emails on OTP creation.

### Typical Runtime Sequence
1. Client requests a password reset via the ResetPassword controller.
2. The controller creates and saves an OTP document.
3. The OTP model’s pre-save hook invokes `utils/mailSender.js` to email the OTP.
4. The user submits the OTP to a verification endpoint.
5. On successful validation, the controller updates the user’s password.
6. Protected endpoints rely on `middlewares/auth.js` for access control.

### What the Code Shows Today
- A backend implementing authentication and password-reset flows, course/content data models, and automated OTP emailing.

---

## 2. 2026-02-04 — Code Flow & What Was Added Today

### Controllers

#### Auth.js
- **sendOTP**:  
  Validates email, checks if the user already exists, generates a unique 6-digit OTP, stores it in the OTP collection, and relies on TTL indexing to auto-expire the OTP after 5 minutes.
- **signup**:  
  Validates request data, checks password match, verifies user existence, fetches the most recent OTP, validates it, hashes the password, creates a Profile document, and creates a new User with a default avatar.
- **login**:  
  Validates credentials, checks user existence, compares hashed passwords, generates a JWT containing role information, stores the token, and sends it via a secure HTTP-only cookie.
- **changePassword**:  
  Controller structure added (logic to be implemented).

#### ResetPassword.js
- **resetPasswordToken**:  
  Validates email, checks user existence, generates a secure reset token, updates the User with the token and expiration time, creates a password-reset URL, and sends it via email.
- **resetPassword**:  
  Validates passwords, verifies reset token, checks token expiry, hashes the new password, updates the User password, and returns a success response.

### Middleware
- **auth.js**: Verifies JWT tokens from cookies, request body, or headers and attaches decoded user data to the request.
- **isStudent**: Restricts access to student-only routes.
- **isAdmin**: Restricts access to admin-only routes.
- **isInstructor**: Restricts access to instructor-only routes.

### Models
- **User.js**: Extended with `token` and `resetPasswordExpires` fields to support password reset functionality.
- **OTP.js**: Stores OTP values with email references and TTL-based expiration; pre-save hook sends OTP emails automatically.
- **Profile.js**: Stores extended user profile details.

### Utilities
- **utils/mailSender.js**: Reused for OTP delivery and password reset email notifications.

### Current Behavior
- OTP records automatically expire and are deleted using TTL indexing.
- Signup and login workflows are fully integrated with OTP verification and JWT-based authentication.
- Password reset flow is functional using secure token-based verification and expiry validation.

---

## 3. 2026-02-09 — Code Flow & What Was Added Today

### Controllers

#### Tag.js
- **createTag**: Allows admin or instructor users to create new course tags.
- **showAllTags**: Fetches and returns all available tags for course categorization and filtering.

#### Course.js
- **createCourse**: Handles course creation including title, description, price, category (tag), thumbnail image upload, and instructor association.
- **showAllCourses**: Fetches all published courses with basic details for listing and browsing.

### Utilities
- **utils/imageUploader.js**:
  - Centralized image upload utility using Cloudinary.
  - Handles image uploads such as course thumbnails and future assets.
  - Returns secure image URLs after successful uploads.
  - Abstracts Cloudinary configuration and upload logic from controllers.

### Models (Used / Integrated)
- **Course.js**: Integrated with tags, instructor (User), and thumbnail image URLs.
- **tags.js**: Used for course categorization and discovery.

### Current Behavior
- Tags can be created and retrieved through API endpoints.
- Courses can be created with thumbnail images uploaded to Cloudinary.
- Course listing endpoints return all available courses for users to browse.

### Typical Runtime Sequence
1. Admin or Instructor creates tags using the Tag controller.
2. Instructor uploads a course thumbnail; `imageUploader` uploads the image to Cloudinary.
3. Course controller creates a new Course document with tag, instructor, and image URL.
4. Users fetch all courses via the `showAllCourses` endpoint.

### What the Code Shows Today
- Tag management functionality implemented.
- Cloudinary-based image upload utility integrated.
- Core course creation and course listing features are operational.
