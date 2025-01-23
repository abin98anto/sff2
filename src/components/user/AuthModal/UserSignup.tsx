import type React from "react";
import { useState } from "react";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { hourglass } from "ldrs";

import { signupSchema } from "../../../shared/config/yupConfig";
import { comments } from "../../../shared/constants/comments";
import GoogleButton from "../google-btn/GoogleButton";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import type { IUser } from "../../../entities/IUser";
import { sendOTP } from "../../../redux/thunks/userSignupServices";
import { userRoles } from "../../../entities/misc/userRole";
import type { AppRootState } from "../../../redux/store";

interface UserSignupProps {
  onSignupSuccess: () => void;
}

const UserSignup: React.FC<UserSignupProps> = ({ onSignupSuccess }) => {
  const { loading } = useSelector((state: AppRootState) => state.user);
  hourglass.register();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userDetails, setUserDetails] = useState<Partial<IUser> | null>(null);

  const dispatch = useAppDispatch();

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
        Swal.fire({
          text: comments.ALL_FIELDS_REQ,
          icon: "error",
          position: "top-end",
          toast: true,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: "swal-compact",
            title: "swal-compact-title",
            htmlContainer: "swal-compact-content",
          },
        });
        return;
      }

      await signupSchema.validate(formData, { abortEarly: false });

      const { confirmPassword, ...data } = formData;
      const userData: IUser = { ...data, role: userRoles.USER };
      setUserDetails(userData);
      await dispatch(sendOTP(userData)).unwrap();
      console.log(`OTP sent to ${userDetails?.email}`);
      onSignupSuccess();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        Swal.fire({
          text: err.errors[0],
          icon: "error",
          position: "top-end",
          toast: true,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: "swal-compact",
            title: "swal-compact-title",
            htmlContainer: "swal-compact-content",
          },
        });
      } else {
        console.log(comments.SIGNUP_FAIL, err);
        Swal.fire({
          text: err as string,
          icon: "error",
          position: "top-end",
          toast: true,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: "swal-compact",
            title: "swal-compact-title",
            htmlContainer: "swal-compact-content",
          },
        });
      }
    }
  };

  return (
    <div className="auth-section">
      <h2>Sign Up</h2>
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
        <button type="submit" disabled={loading}>
          {loading ? (
            <l-hourglass
              size="20"
              bg-opacity="0.1"
              speed="1.75"
              color="black"
            ></l-hourglass>
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
    </div>
  );
};

export default UserSignup;
