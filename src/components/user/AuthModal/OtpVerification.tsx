import type React from "react";
import { useRef, useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../redux/store";
import { axiosInstance } from "../../../shared/config/axiosConfig";
import { API } from "../../../shared/constants/API";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { signUpUser } from "../../../redux/thunks/userSignupServices";
import { IUser } from "../../../entities/IUser";
import { comments } from "../../../shared/constants/comments";

const OtpVerification: React.FC = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "error"
  );

  const dispatch = useAppDispatch();

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const userInfo = useSelector((state: AppRootState) => state.userInfo);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
  }, [timeLeft, isTimerActive]);

  const handleInput = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.some((digit) => digit.trim() === "")) {
      setSnackbarMessage(comments.ALL_FIELDS_REQ);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    console.log("Verifying OTP:", otp.join(""));
  };

  const handleResendOtp = async () => {
    console.log("Resending OTP");
    try {
      await axiosInstance.delete(`${API.USER_DELETE}?email=${userInfo?.email}`);

      await dispatch(signUpUser(userInfo as IUser)).unwrap();

      setTimeLeft(60);
      setIsTimerActive(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.log("error resending otp", error);
      setSnackbarMessage(error as string);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="auth-section">
      <h2>OTP Verification</h2>
      <form onSubmit={handleVerify}>
        <div className="otp-inputs">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={otp[index]}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleInput(index, e.target.value)}
            />
          ))}
        </div>
        <div className="timer-container">
          <div style={{ width: 60, height: 60 }}>
            <CircularProgressbar
              value={timeLeft}
              maxValue={60}
              text={`${timeLeft}`}
              styles={buildStyles({
                textSize: "32px",
                pathTransitionDuration: 0.5,
                pathColor: `rgba(62, 152, 199, ${timeLeft / 60})`,
                textColor: "#3e98c7",
                trailColor: "#d6d6d6",
              })}
            />
          </div>
        </div>
        {isTimerActive ? (
          <button type="submit">Verify OTP</button>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="resend-otp-button"
          >
            Resend OTP
          </button>
        )}
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

export default OtpVerification;
