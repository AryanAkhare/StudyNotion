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

## 2026-02-10 — Code Flow & What Was Added Today

### Controllers

#### Section.js
- **createSection**  
  Creates a new Section using `sectionName`.  
  Pushes the Section `_id` into `Course.courseContent`.  
  Returns the updated Course with populated `courseContent → subSection`.

- **updateSection**  
  Updates an existing Section’s `sectionName` using `sectionId`.  
  Uses `runValidators` to enforce schema validation rules.

- **deleteSection**  
  Removes the Section `_id` from `Course.courseContent`.  
  Deletes the Section document from the database.

---

#### SubSection.js
- **createSubSection**  
  Validates required fields (`sectionId`, `title`, `timeDuration`, `description`, `video`).  
  Uploads subsection video to Cloudinary using `utils/imageUploader.js`.  
  Creates a SubSection document and pushes its `_id` into `Section.subSection`.  
  Returns the updated Section populated with all subsections.

- **deleteSubSection**  
  Removes the SubSection `_id` from `Section.subSection`.  
  Deletes the SubSection document from the database.

---

#### Profile.js
- **updateProfile**  
  Updates user profile fields (`dateOfBirth`, `about`, `gender`, `contactNumber`).  
  Fetches the Profile document via `User.additionalDetails` and saves updated information.

- **deleteAccount**  
  Deletes the user’s Profile document and User account.  
  (Cleanup of enrolled course references marked as TODO.)

- **getAllUserDetails**  
  Fetches the authenticated User document with populated `additionalDetails`.

---

### Models (Updated / Used)
- **Course.js**  
  `courseContent` updated dynamically when Sections are added or removed.  
  Tag field renamed to **category**.

- **Section.js**  
  Stores references to SubSections in the `subSection` array.

- **SubSection.js**  
  Stores lesson metadata including title, duration, description, and Cloudinary video URL.

- **User.js & Profile.js**  
  Used for profile updates, account deletion, and retrieving complete user details.

---

### Utilities
- **utils/imageUploader.js**  
  Handles video uploads for subsections using Cloudinary.  
  Returns secure video URLs and abstracts Cloudinary logic from controllers.

---

### Current Behavior
- Courses now support hierarchical content structure:

Course → Sections → SubSections (with video)


- Sections and SubSections can be created, updated, and deleted dynamically.
- Profile update and account deletion flows are functional.
- Media uploads are centralized via the Cloudinary utility.

---

### Typical Runtime Sequence
1. Instructor creates a Section → Section `_id` added to Course.
2. Instructor adds SubSections → video uploaded → SubSection linked to Section.
3. Instructor deletes a Section or SubSection → references cleaned from parent documents.
4. User updates profile details.
5. User deletes account → Profile and User documents removed.

---

### What the Code Shows Today
- Section and SubSection CRUD functionality fully implemented.
- Course content hierarchy finalized.
- Profile management and account deletion workflows implemented.
- Cloudinary integrated for subsection video uploads.


## 2026-02-11 — Code Flow & What Was Added Today

### Payment Integration — Razorpay (Backend)

Razorpay payment gateway integrated to enable secure course purchases.

---

### Configuration

#### config/razorpay.js
- Razorpay instance initialized using:
  - `RAZORPAY_KEY`
  - `RAZORPAY_SECRET`
- Exports reusable `instance` for order creation.

- Centralized configuration ensures secure environment-based key management.

---

### Controllers

#### Payment.js

---

### capturePayment

**Purpose:**  
Creates a Razorpay order for a selected course.

**Flow:**

1. Extracts:
   - `course_id` from request body
   - `userId` from authenticated `req.user`

2. Validates:
   - Course ID is provided.
   - Course exists in database.
   - User is not already enrolled.

3. Creates Razorpay order:
   - Amount converted to paise (`price * 100`)
   - Currency set to `INR`
   - Receipt generated
   - `notes` include:
     - `courseId`
     - `userId`

4. Calls:
   ```js
   instance.orders.create(options)
   ```

5. Returns:
   - `orderId`
   - `amount`
   - `currency`
   - Course metadata (name, description, thumbnail)

---

### verifySignature (Webhook Handler)

**Purpose:**  
Verifies Razorpay webhook signature and enrolls student after successful payment.

**Flow:**

1. Extracts signature from:
   ```
   x-razorpay-signature
   ```

2. Generates HMAC SHA256 hash using:
   - `RAZORPAY_WEBHOOK_SECRET`
   - Request body

3. Compares generated digest with received signature.

4. If signature matches:
   - Extracts `courseId` and `userId` from:
     ```
     req.body.payload.payment.entity.notes
     ```
   - Adds user to `Course.studentsEnrolled`
   - Adds course to `User.courses`
   - Sends enrollment confirmation email

5. Returns success response.

6. If signature fails:
   - Returns 400 Invalid signature.

---

### Utilities Used

- **utils/mailSender.js**
  - Sends enrollment confirmation email after successful payment verification.

- **crypto (Node.js)**
  - Used for SHA256 HMAC signature verification.

---

### Models Integrated

- **Course.js**
  - `studentsEnrolled` updated after payment success.

- **User.js**
  - `courses` array updated after enrollment.

---

### Current Behavior

Full payment lifecycle implemented:

UI → Pay Now → Order Created → Razorpay Modal → Payment Success → Webhook → Signature Verification → Enrollment → Email Sent

- Order creation secured via Razorpay instance.
- Webhook signature verification prevents tampering.
- Automatic enrollment after successful payment.
- Confirmation email sent post-enrollment.

---

### Typical Runtime Sequence

1. User clicks **Pay Now**.
2. Backend creates Razorpay order.
3. Razorpay modal handles payment (UPI / Card / etc.).
4. Razorpay triggers webhook event.
5. Backend verifies signature.
6. User enrolled in course.
7. Confirmation email sent.

---

### What the Code Shows Today

- Razorpay backend integration completed.
- Secure order creation implemented.
- Webhook-based payment verification implemented.
- Automatic course enrollment system integrated with payment flow.
- Email notification system connected to payment success.

```
## 2026-02-15 — Code Flow & What Was Added Today

---

### Controllers

#### Course.js

---

### getCourseDetails

**Purpose:**  
Fetch complete course details including instructor, category, ratings, sections, and subsections.

**Flow:**

1. Extract `course_id` from request body.
2. Fetch course using `Course.find`.
3. Populate:
   - `instructor`
     - Nested populate → `additionalDetails`
   - `category`
   - `ratingAndReviews`
   - `courseContent`
     - Nested populate → `subSection`
4. Validate if course exists.
5. Return full structured course details.

**Current Behavior:**

- Returns hierarchical course structure:
  
  Course → Sections → SubSections  
  Instructor → AdditionalDetails  
  Category  
  Ratings & Reviews  

---

#### RatingAndReview.js

---

### createRating

**Purpose:**  
Allow enrolled students to submit ratings and reviews.

**Flow:**

1. Extract:
   - `userId` from `req.user`
   - `rating`, `review`, `courseId` from request body
2. Check if student is enrolled in the course.
3. Check if student has already reviewed the course.
4. Create `RatingAndReview` document.
5. Push review `_id` into `Course.ratingAndReviews`.
6. Return success response.

**Behavior Implemented:**

- Prevents non-enrolled students from reviewing.
- Prevents duplicate reviews.
- Links review to course properly.

---

### getAverageRating

**Purpose:**  
Calculate and return average rating for a course.

**Flow:**

1. Validate `courseId`.
2. Use MongoDB Aggregation:
   - `$match` course
   - `$group` and calculate `$avg` of rating
3. Round to 1 decimal.
4. Return average rating.

**Behavior:**

- Returns `0` if no ratings exist.
- Safe ObjectId validation implemented.

---

### getAllRating

**Purpose:**  
Fetch all ratings sorted by highest rating.

**Flow:**

1. Fetch all reviews.
2. Sort by `rating` descending.
3. Populate:
   - `user` → select `firstName lastName email image`
   - `course` → select `courseName`
4. Return response.

---

#### Category.js

---

### categoryPageDetails

**Purpose:**  
Fetch category page data including:

- Selected category courses
- Different categories
- Top selling courses

**Flow:**

1. Extract `categoryId`.
2. Fetch selected category and populate courses.
3. Fetch other categories (`$ne` current id).
4. Fetch top 5 selling courses:
   - Sorted by `totalStudentsEnrolled`
5. Return structured response.

---

### Current System Capabilities (As of 15-02-2026)

- Full course detail retrieval with deep population.
- Course review creation with enrollment validation.
- Average rating aggregation.
- Fetch all ratings with user and course data.
- Category page structured data API.
- Top selling course sorting implemented.

---

### Backend Status Level

The backend now includes:

- Authentication system
- OTP & password reset flow
- Course management (CRUD)
- Section & SubSection hierarchy
- Cloudinary media integration
- Razorpay payment integration
- Enrollment system
- Review & rating system
- Category page API with top selling logic

Backend architecture is now approaching **production-level LMS backend structure**.
