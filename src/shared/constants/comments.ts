import dotenv from "dotenv";
dotenv.config();

export const comments = {
  GET_COMM: "API is running...",
  SERVER_SUCC: `Server running on port http://localhost:${process.env.PORT}`,
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
};