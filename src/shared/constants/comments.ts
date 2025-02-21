const comments = {
  ALL_FIELDS_REQ: "Please fill all the fields.",
  CPASS_REQ: "Confirm password is required",
  CPASS_INVALID: "Passwords must match",
  NAME_REQ: "Username is required",
  NAME_INVALID: "Username must be at least 3 characters",
  PASS_REQ: "Password is required",
  PASS_INVALID: "Password must be at least 8 characters",
  EMAIL_INVALID: "Invalid email",
  EMAIL_REQ: "Email is required",
  GET_COMM: "API is running...",
  MONGO_SUCC: "MongoDB connected successfully!",
  MONGO_FAIL: "MongoDB connection failed:",
  CORS_FAIL: "Not allowed by CORS",
  EMAIL_TAKEN: "Email already taken.",
  OTP_SUCC: "OTP sent successfully!",
  OTP_DFLT: "111111",
  OTP_FAIL: "error sending OTP mail",
  OTP_CREATE_FAIL: "error creating OTP",
  OTP_WRONG: "Enterd OTP is incorrect.",
  OTP_EXPIRED: "OTP Expired",
  HASH_FAIL: "error hashing password",
  SERVER_ERR: "Internal server error",
  UNKOWN_ERR: "An unknown error occurred",
  USER_NOT_FOUND: "User not found.",
  USER_VERIFIED: "User Verified.",
  VERIFY_OTP_FAIL: "Error verifying OTP",
  USER_DEL_USECASE_FAIL: "Error Deleting User in UseCase.",
  USER_DEL_SUCC: "Deleted User Successfully.",
  USER_DEL_FAIL: "Error Deleting User.",
  USER_DEL_THK_FAIL: "Error Deleting User in Thunk.",
  SIGNUP_SUCC: "Form submitted successfully!",
  SIGNUP_THNK_FAIL: "Error in signUpUser Thunk.",
  SIGNUP_FAIL: "Error in user signup",
  VERIFY_OTP_THUNK_FAIL: "Error verifying OTP in thunk.",
  VERIFY_OTP_FE_FAIL: "Error verifying OTP",
  OTP_RESND_FAIL: "error resending otp",
  LOGIN_FE_ERR: "Error sending user data to backend.",
  LOGIN_THNK_FAIL: "Error in login thunk",
  LOGOUT_THNK_ERR: "Error in Logout thunk",
  CAT_FETCH_FAIL: "Error fetching categories",
  CAT_ADD_FAIL: "Error adding category",
  CAT_UPDATE_FAIL: "Error updating category",
  CAT_DELETE_FAIL: "Error deleting category",
  DATA_FETCH_ERR: "Error fetching data",
  CAT_ADD_SUCC: "Category added successfully!",
  CAT_NAME_DUP: "Category name already exists!",
  CAT_UPDATE_SUCC: "Category updated successfully!",
  CAT_DELETE_SUCC: "Category deleted successfully!",
  COURSE_FETCH_FAIL: "Error fetching courses",
  COURSE_UNLIST: "Are you sure you want to unlist this course?",
  S3_UPLOAD_ERR: "Error uploading file to S3",
  S3_DELETE_ERR: "Error deleting file from S3",
  IMG_UPLOAD_FAIL: "Error uploading image",
  IMG_UPLOAD_SUCC: "Image uploaded successfully!",
  FILE_UPLOAD_FAIL: "Failed to upload file",
  FILE_UPLOAD_SUCC: "File uploaded successfully!",
  USER_UPDATE_THK_FAIL: "Error updating user in thunk",
  RESUME_UPLOAD_FAIL: "Error uploading resume",
  RESUME_UPLOAD_SUCC: "Resume uploaded successfully!",
  RESUME_DELETE_FAIL: "Error deleting resume",
  RESUME_DELETE_SUCC: "Resume deleted successfully!",
  USR_UPDATED_SUCC: "User updated successfully!",
  USR_UPDATED_FAIL: "Error updating user",

  THUMBNAIL_REQ: "Thumbnail is required",
  DESCRIPTION_RQ: "Description is required",
  TITLE_REQ: "Title is required",
  SUBTITLE_REQ: "Subtitle is required",
  CAT_REQ: "Category is required",
  TOPIC_REQ: "Topic is required",
  LANG_REQ: "Language is required",
  DURA_REQ: "Duration is required",
  THUMBNAIL_DEFAULT: "Upload your course thumbnail",
  LESSON_REQ: "Lesson name is required",
  TOPIC_PLACEHOLDER: "What is primarily taught in your course?",
  DURA_PLACEHOLDER: "Course duration",
  INVALID_VIDEO:
    "Invalid video file. Please upload a valid MP4, WebM, or OGG video file (max 100MB).",
  VIDEO_UPLOAD_FAIL: "Failed to upload video",
  SECTION_REQ: "At least one section is required",
  LESSON_REQ2: "Each section must have at least one lecture",
  COURSE_PUB_SUCC: "Course published successfully:",
  COURSE_PUB_FAIL: "Failed to publish course. Please try again.",
  NO_CAT_RECIVIED: "No categories data received",
  LOADING: "Loading...",
  IMG_UPLOAD_SUCCESS: "Image uploaded successfully",
  UPLOADING: "Uploading...",
  UPLOAD: "Upload",

  DESCRIPTION_PLACEHOLDER: "Provide a detailed description.",
  ADD_LESSSON: "Create Lesson",
  VIDEO_UPLOAD: "Upload New Video",
  VIDEO_CHANGE: "Change Video",
  LESSON_UPDATE: "Update Lesson",
  PUBLISHING: "Publishing...",
  COURSE_PUB: "Publish Course",
  NO_COURSE_ID: "No course ID provided. Please go back and try again.",
  INVALID_COURSE: "Invalid course data structure",
  COURSE_UPDATE_FAIL: "Failed to update course. Please try again.",
  VIDEO_REQ: "Vedio is required.",
  COURSE_DISCARD: "Are you sure you want to discard this course?",
  PREREQ_PH: "Enter the prerequesities.",
  LEVEL_REQ: "Need the course level.",
};

export default comments;
