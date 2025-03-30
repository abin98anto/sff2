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
    COURSES: "/courses",

  // Cloudinary
  CLOUDI_UPLOAD: `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/raw/upload`,

  // Admin Side.
  TUTORS_GET: "/admin/users/tutor",

  // Subscription Side.
  SUBSCRIPIIONS: "/subscriptions",
  SUBSCRIPTION_GET: "/subsciption",
  SUBSCRIPTION_ADD: "/subsciption/add",
  SUBSCRIPTION_UPDATE: "/subsciption/update",
  SUBSCRIPTION_NEW_USER: "/subsciption/new-subscriber",

  // Users
  USERS_LIST: "/admin/users",
  USER_BLOCK: "/admin/block",
  TUTOR_APPROVE: "/admin/approve",
  TUTOR_DENY: "/admin/deny",

  // Razor pay
  RAZORPAY_CHECKOUT: "https://checkout.razorpay.com/v1/checkout.js",
  RAZORPAY_ADD: "/order/razorpay/create",
  ORDER_ADD: "/order/add",

  // Video call
  VIDEO_CALL: "/video-call?roomID=",
  CHAT_LIST: "/chat/list?userId=",
  CHAT_MESSAGES: "/chat/messages/",
  MSG_SENT: "/chat/send",
  VIDEO_CALL_PAGE: "/chat/video-call",

  // Tutor sidebar links.
  TUTOR_DASHBOARD: "/tutor",
  TUTOR_STUDENTS: "/tutor/my-students",
  TUTOR_PROFILE: "/tutor/profile",

  // Forgot Password
  SET_PASS: "/set-password",
  FORGOT_PASS: "/forgot-password",

  // User Login
  ADMIN_DASH: "/admin/dashboard",

  // Google
  G_QUERY_SELECT: 'script[src="https://accounts.google.com/gsi/client"]',
  G_ACCOUNTS: "https://accounts.google.com/gsi/client",

  MY_LEARNING: "/my-learning",

  // Course
  ADD_COURSE: "/admin/add-course",
  EDIT_COURSE: "/admin/edit-course",

  // Chat
  CHAT_STUDENT_LIST: "/chat/student-list",

  // Enrollment
  ENROLLMENT_GET_DETAILS: "/enrollment/get-enroll-details",
  ENROLLMENT_UPDATE: "/enrollment/update",
};

export default API;
