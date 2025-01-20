import type React from "react";
import { useState } from "react";
import * as Yup from "yup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Eye, EyeOff } from "lucide-react";

import { signupSchema } from "../../../shared/config/yupConfig";
import { comments } from "../../../shared/constants/comments";
import GoogleButton from "../google-btn/GoogleButton";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import type { IUser } from "../../../entities/IUser";
import { signUpUser } from "../../../redux/thunks/userSignupServices";
import { userRoles } from "../../../entities/misc/userRole";

interface UserSignupProps {
  onSignupSuccess: () => void;
}

const UserSignup: React.FC<UserSignupProps> = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "error"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useAppDispatch();
  const [userDetails, setUserDetails] = useState<Partial<IUser> | null>(null);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyField = Object.keys(formData).find(
      (key) => formData[key as keyof typeof formData].trim() === ""
    );

    if (emptyField) {
      setSnackbarMessage(comments.ALL_FIELDS_REQ);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await signupSchema.validate(formData, { abortEarly: false });

      const { confirmPassword, ...data } = formData;
      const userData: IUser = { ...data, role: userRoles.USER };
      setUserDetails(userData);
      console.log("user details in state", userDetails);
      const result = await dispatch(signUpUser(userData)).unwrap();
      console.log("the result", result);

      setSnackbarMessage(comments.SIGNUP_SUCC);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      console.log(comments.SIGNUP_SUCC, formData);

      onSignupSuccess();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setSnackbarMessage(err.errors[0]);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } else {
        console.log("error in usersignup", err);
        setSnackbarMessage(err as string);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
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
            aria-label={showPassword ? "Hide password" : "Show password"}
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
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit">Sign Up</button>

        <div className="divider">
          <span>or</span>
        </div>
        <div className="google-signin-button">
          <GoogleButton /> <p>Sign in with Google</p>
        </div>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserSignup;
