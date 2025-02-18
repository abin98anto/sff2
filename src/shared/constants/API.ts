export const API = {
  FRONT_END: "http://localhost:5173",

  LANDING: "/",

  // User Auth
  OTP_SENT: "/send-otp",
  OTP_VERIFY: "/verify-otp",
  USER_DELETE: "/delete-user",
  USER_LOGIN: "/login",
  USER_LOGOUT: "/logout",

  // Categories
  CATEGORY_ADD: "/categories/add",
  CATEGORY_DELETE: "/categories/delete",
  CATEGORY_UPDATE: "/categories/update",
  CATEGORY_GET: "/categories",

  // Courses
  COURSE_MNGMT: "/admin/course-management",
  COURSE_ADD: "/courses/add",
  COURSE_DELETE: "/courses/delete",
  COURSE_UPDATE: "/courses/update",
  COURSE_GET: "/courses",
};
