import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { hourglass } from "ldrs";

import GoogleButton from "./google-btn/GoogleButton";
import comments from "../../../shared/constants/comments";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../common/CustomSnackbar";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { AppRootState } from "../../../redux/store";
import LoginData from "../../../entities/misc/LoginData";
import { login } from "../../../redux/thunks/user/userAuthServices";
import { useNavigate } from "react-router-dom";

interface UserLoginProps {
  userRole: "user" | "tutor" | "admin";
  image: string;
  onClose: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ userRole, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const { loading } = useAppSelector((state: AppRootState) => state.user);
  const dispatch = useAppDispatch();
  hourglass.register();

  const navigate = useNavigate();

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

      const userData: LoginData = {
        ...formData,
        role: userRole,
      };

      await dispatch(login(userData)).unwrap();
      if (userRole === "tutor") {
        navigate("/tutor");
      } else if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        onClose();
      }
    } catch (error) {
      console.log(comments.LOGIN_FE_ERR, error);
      showSnackbar(error as string, "error");
      return;
    }
  };

  return (
    <div className="auth-section">
      {userRole === "admin" && <h1>Admin Login</h1>}
      {userRole === "tutor" && <h2>Tutor Login</h2>}
      {userRole === "user" && <h2>User Login</h2>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">
          {loading ? (
            <l-hourglass
              size="20"
              bg-opacity="0.1"
              speed="1.75"
              color="black"
            ></l-hourglass>
          ) : userRole === "tutor" ? (
            "Login as Tutor"
          ) : (
            "Login"
          )}
        </button>

        {userRole !== "admin" && (
          <div className="divider">
            <span>or</span>
          </div>
        )}

        {userRole !== "admin" && (
          <div className="google-signin-button">
            <GoogleButton />
            <span>Login with Google</span>
          </div>
        )}
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

export default UserLogin;
