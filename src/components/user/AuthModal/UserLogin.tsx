import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { hourglass } from "ldrs";

import comments from "../../../shared/constants/comments";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../common/CustomSnackbar";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { AppRootState } from "../../../redux/store";
import LoginData from "../../../entities/misc/LoginData";
import {
  googleSignIn,
  login,
} from "../../../redux/thunks/user/userAuthServices";
import { useNavigate } from "react-router-dom";
import userRoles from "../../../entities/misc/userRole";
import { jwtDecode } from "jwt-decode";

// Add TypeScript declarations for Google Sign-In API
interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    element: HTMLElement | null,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
    }
  ) => void;
  prompt: () => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

// Extend Window interface
declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

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
  const [googleInitialized, setGoogleInitialized] = useState(false);

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

  const handleGoogleSignIn = async (response: GoogleCredentialResponse) => {
    try {
      if (!response.credential) {
        showSnackbar("No Google credentials received", "error");
        return;
      }

      const decoded: any = jwtDecode(response.credential);
      // console.log("Google sign-in successful. Decoded token:", decoded);

      const user = {
        name:
          decoded.name ||
          `${decoded.given_name} ${decoded.family_name || ""}`.trim(),
        email: decoded.email,
        profilePicture: decoded.picture,
        role: userRole === "tutor" ? userRoles.TUTOR : userRoles.USER,
      };

      console.log("Sending user data to backend:", user);
      const result = await dispatch(googleSignIn(user)).unwrap();

      if (result && result.user) {
        console.log("Login successful, navigating to home");
        onClose();
      } else {
        showSnackbar(
          "Google sign-in failed: Unexpected response from server",
          "error"
        );
      }
    } catch (error) {
      console.error("Google sign-in failed", error);
      showSnackbar("Google sign-in failed. Please try again later.", "error");
    }
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if the Google script is already loaded
      if (
        document.querySelector(
          'script[src="https://accounts.google.com/gsi/client"]'
        )
      ) {
        initializeGoogleSignIn();
        return;
      }

      // Load the Google script if it's not already loaded
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error("Failed to load Google Sign-In script");
        showSnackbar(
          "Failed to load Google Sign-In. Please try again later.",
          "error"
        );
      };
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && !googleInitialized) {
        try {
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
          if (!clientId) {
            console.error("Google Client ID is not configured");
            showSnackbar("Google Sign-In is not properly configured", "error");
            return;
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Only render the button if the container exists
          const buttonContainer = document.getElementById(
            "google-signin-button"
          );
          if (buttonContainer) {
            window.google.accounts.id.renderButton(buttonContainer, {
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              width: 240,
            });
          } else {
            console.error("Google sign-in button container not found");
          }

          setGoogleInitialized(true);
          console.log("Google Sign-In initialized successfully");
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error);
          showSnackbar("Failed to initialize Google Sign-In", "error");
        }
      }
    };

    loadGoogleScript();

    // Clean up function
    return () => {};
  }, [showSnackbar, googleInitialized, userRole]);

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
          <div
            id="google-signin-button"
            className="google-signin-container"
          ></div>
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
