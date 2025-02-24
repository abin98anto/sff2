const API = {
  FRONT_END: "http://localhost:5173",

  LANDING: "/",

  // User Auth
  OTP_SENT: "/send-otp",
  OTP_VERIFY: "/verify-otp",
  USER_DELETE: "/delete-user",
  USER_LOGIN: "/login",
  USER_LOGOUT: "/logout",

  // User Update
  USER_UPDATE: "/update",

  // Categories
  CATEGORY_ADD: "/categories/add",
  CATEGORY_DELETE: "/categories/delete",
  CATEGORY_UPDATE: "/categories/update",
  CATEGORY_GET: "/categories",

  // Courses
  COURSE_MNGMT: "/admin/course-management",
  COURSE_ADD: "/course/add",
  COURSE_DELETE: "/courses/delete",
  COURSE_UPDATE: "/course/update",
  COURSE_GET: "/course",

  // Cloudinary
  CLOUDI_UPLOAD: `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/raw/upload`,

  // Admin Side.
  TUTORS_GET: "/admin/users/tutor",

  // Subscription Side.
  SUBSCRIPTION_GET: "/subsciption",
  SUBSCRIPTION_ADD: "/subsciption/add",
  SUBSCRIPTION_UPDATE: "/subsciption/update",
  SUBSCRIPTION_NEW_USER: "/subsciption/new-subscriber",

  // Users
  USERS_LIST: "/admin/users",
  USER_BLOCK: "/admin/block",
};

export default API;
