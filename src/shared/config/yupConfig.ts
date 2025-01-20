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
  name: Yup.string().min(3, comments.NAME_INVALID).required(comments.NAME_REQ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], comments.CPASS_INVALID)
    .required(comments.CPASS_REQ),
});
