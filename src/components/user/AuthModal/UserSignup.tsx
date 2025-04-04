import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { hourglass } from "ldrs";
import { jwtDecode } from "jwt-decode";

import {
  googleSignIn,
  sendOTP,
} from "../../../redux/thunks/user/userAuthServices";
import { signupSchema } from "../../../shared/config/yupConfig";
import comments from "../../../shared/constants/comments";
import { IUser } from "../../../entities/IUser";
import userRoles from "../../../entities/misc/userRole";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { AppRootState } from "../../../redux/store";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../common/CustomSnackbar";
import API from "../../../shared/constants/API";

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

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

interface UserSignupProps {
  onSignupSuccess: () => void;
  userRole: "user" | "tutor";
  image?: string;
  onClose: () => void;
}

const UserSignup: React.FC<UserSignupProps> = ({
  onSignupSuccess,
  userRole,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

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
        createdAt: "",
      };

      const dispatchResult = await dispatch(sendOTP(userData));
      console.log("the dispatch result", dispatchResult);

      if (dispatchResult.type !== "user/sendOTP/fulfilled") {
        showSnackbar(dispatchResult.payload as string, "error");
        return;
      }

      // Always call onSignupSuccess to navigate to OTP verification for both users and tutors
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

  const handleGoogleSignIn = async (response: GoogleCredentialResponse) => {
    try {
      if (!response.credential) {
        showSnackbar(comments.OAUTH_TOKEN_MISSING, "error");
        return;
      }

      const decoded: any = jwtDecode(response.credential);

      const user = {
        name:
          decoded.name ||
          `${decoded.given_name} ${decoded.family_name || ""}`.trim(),
        email: decoded.email,
        profilePicture: decoded.picture,
        role: userRole === "tutor" ? userRoles.TUTOR : userRoles.USER,
      };

      const result = await dispatch(googleSignIn(user)).unwrap();

      if (result && result.user) {
        // Check if the user is verified before closing
        if (result.user.isVerified) {
          onClose();
        } else {
          // If not verified, navigate to OTP verification
          onSignupSuccess();
        }
      } else {
        showSnackbar(comments.OAUTH_FAIL, "error");
      }
    } catch (error) {
      console.error(comments.OAUTH_FAIL, error);
      showSnackbar(comments.OAUTH_FAIL, "error");
    }
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.querySelector(API.G_QUERY_SELECT)) {
        initializeGoogleSignIn();
        return;
      }

      // Load the Google script if it's not already loaded
      const script = document.createElement("script");
      script.src = API.G_ACCOUNTS;
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error(comments.OAUTH_FAIL);
        showSnackbar(comments.OAUTH_FAIL, "error");
      };
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && !googleInitialized) {
        try {
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
          if (!clientId) {
            console.error(comments.OAUTH_NOCLIENTID);
            showSnackbar(comments.OAUTH_NOCLIENTID, "error");
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
              text: "signin_with",
              shape: "rectangular",
              width: 240,
            });
          } else {
            console.error(comments.OAUTH_FAIL);
          }

          setGoogleInitialized(true);
          console.log(comments.OAUTH_INIT);
        } catch (error) {
          console.error(comments.OAUTH_INIT, error);
          showSnackbar(comments.OAUTH_INIT, "error");
        }
      }
    };

    loadGoogleScript();

    return () => {};
  }, [showSnackbar, googleInitialized, userRole]);

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

        <div
          id="google-signin-button"
          className="google-signin-container"
        ></div>
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
