import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import CustomSnackbar from "../../common/CustomSnackbar";
import useSnackbar from "../../../hooks/useSnackbar";
import axiosInstance from "../../../shared/config/axiosConfig"; // Assuming this is your axios config

interface ForgotPasswordProps {
  onPasswordChanged: () => void;
  image?: string;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onPasswordChanged,
}) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpComplete, setIsOtpComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }

      const isFilled = newOtp.every((digit) => digit !== "");
      setIsOtpComplete(isFilled);
    }
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      showSnackbar("Please enter a valid email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put("/forgot-password", { email });
      if (response.data.success) {
        setIsOtpSent(true);
        setTimer(60);
        showSnackbar("OTP sent successfully", "success");
      } else {
        showSnackbar(response.data.message || "Failed to send OTP", "error");
      }
    } catch (error) {
      showSnackbar("Error sending OTP. Please try again.", "error");
      console.error("Forgot Password OTP Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showSnackbar("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put("/set-password", {
        email,
        otp: otp.join(""), // Combine OTP array into a string
        password: newPassword,
      });

      if (response.data.success) {
        showSnackbar("Password reset successfully", "success");
        onPasswordChanged();
      } else {
        showSnackbar(
          response.data.message || "Failed to reset password",
          "error"
        );
      }
    } catch (error) {
      showSnackbar("Error resetting password. Please try again.", "error");
      console.error("Reset Password Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="auth-section">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative", display: "flex", gap: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isOtpSent || isLoading}
          />
          <button
            type="button"
            className="resend-otp-button"
            onClick={handleSendOtp}
            disabled={(isOtpSent && timer > 0) || isLoading}
            style={{ padding: "0.75rem 1rem", minWidth: "100px" }}
          >
            {isLoading && !isOtpSent ? "Sending..." : "Send OTP"}
          </button>
        </div>

        {isOtpSent && (
          <div className="timer-container">
            <span>
              {timer > 0 ? `Resend OTP in ${timer}s` : "You can resend OTP now"}
            </span>
          </div>
        )}

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              disabled={!isOtpSent || isLoading}
            />
          ))}
        </div>

        <div className="password-input">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={!isOtpComplete || isLoading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowNewPassword(!showNewPassword)}
            disabled={!isOtpComplete || isLoading}
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="password-input">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!isOtpComplete || isLoading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={!isOtpComplete || isLoading}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button type="submit" disabled={!isOtpComplete || isLoading}>
          {isLoading && isOtpComplete ? "Changing..." : "Change Password"}
        </button>
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

export default ForgotPassword;
