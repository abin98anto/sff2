import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { hourglass } from "ldrs";

import GoogleButton from "./google-btn/GoogleButton";
import { sendOTP } from "../../../redux/thunks/user/userAuthServices";
import { signupSchema } from "../../../shared/config/yupConfig";
import comments from "../../../shared/constants/comments";
import { IUser } from "../../../entities/IUser";
import userRoles from "../../../entities/misc/userRole";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { AppRootState } from "../../../redux/store";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../common/CustomSnackbar";

interface UserSignupProps {
  onSignupSuccess: () => void;
  userRole: "user" | "tutor";
  image: string;
}

const UserSignup: React.FC<UserSignupProps> = ({
  onSignupSuccess,
  userRole,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const { loading } = useAppSelector((state: AppRootState) => state.user);
  const dispatch = useAppDispatch();
  hourglass.register();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const emptyField = Object.keys(formData).find(
        (key) => formData[key as keyof typeof formData].trim() === ""
      );

      if (emptyField) {
        showSnackbar(comments.ALL_FIELDS_REQ, "error");
        return;
      }

      await signupSchema.validate(formData, { abortEarly: false });

      const { confirmPassword, ...data } = formData;
      const userData: IUser = {
        ...data,
        role: userRole === "tutor" ? userRoles.TUTOR : userRoles.USER,
        createdAt: ""
      };
      await dispatch(sendOTP(userData));
      onSignupSuccess();
    } catch (err) {
      if (err instanceof Error && "inner" in err) {
        const yupError = err as any;
        if (yupError.inner && yupError.inner.length > 0) {
          const errors = yupError.inner.map((error: any) => error.message);
          const errorMessage = errors.join("\n");
          showSnackbar(errorMessage, "error");
        }
      } else if (err instanceof Error) {
        showSnackbar(err.message, "error");
      } else {
        console.log(comments.SIGNUP_FAIL, err);
      }
    }
  };

  return (
    <div className="auth-section">
      <h2>{userRole === "tutor" ? "Tutor Sign Up" : "User Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="password-input">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit">
          {loading ? (
            <l-hourglass
              size="20"
              bg-opacity="0.1"
              speed="1.75"
              color="black"
            ></l-hourglass>
          ) : userRole === "tutor" ? (
            "Sign Up as Tutor"
          ) : (
            "Sign Up"
          )}
        </button>

        <div className="divider">
          <span>or</span>
        </div>
        <div className="google-signin-button">
          <GoogleButton />
          <span>Sign in with Google</span>
        </div>
      </form>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default UserSignup;
