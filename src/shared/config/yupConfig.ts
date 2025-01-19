import * as Yup from "yup";
import { comments } from "../constants/comments";

const loginFields = {
  email: Yup.string()
    .email(comments.EMAIL_INVALID)
    .required(comments.EMAIL_REQ),
  password: Yup.string()
    .min(8, comments.PASS_INVALID)
    .required(comments.PASS_REQ),
};

export const loginSchema = Yup.object().shape(loginFields);

export const signupSchema = Yup.object().shape({
  ...loginFields,
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});
