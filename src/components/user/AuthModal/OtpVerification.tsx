import React, { useRef, useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { hourglass } from "ldrs";
// import { useNavigate } from "react-router-dom";

import axiosInstance from "../../../shared/config/axiosConfig";
import comments from "../../../shared/constants/comments";
import API from "../../../shared/constants/API";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import {
  sendOTP,
  verifyOTP,
} from "../../../redux/thunks/user/userAuthServices";
import { IUser } from "../../../entities/IUser";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../common/CustomSnackbar";
// import userRoles from "../../../entities/misc/userRole";

interface OtpVerificationProps {
  onVerificationSuccess: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  onVerificationSuccess,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const { loading, userInfo } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  // const navigate = useNavigate();
  hourglass.register();

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.some((digit) => digit.trim() === "")) {
      showSnackbar(comments.ALL_FIELDS_REQ, "error");
      return;
    }

    try {
      if (!userInfo?.email) {
        showSnackbar("User information is missing", "error");
        return;
      }

      const result = await dispatch(
        verifyOTP({ email: userInfo.email, otp: otp.join("") })
      ).unwrap();

      if (result.success) {
        showSnackbar(comments.USER_VERIFIED, "success");

        // Always call onVerificationSuccess for both user and tutor roles
        // This will navigate them back to the login screen
        onVerificationSuccess();
      } else {
        console.log(comments.VERIFY_OTP_FAIL, result);
        showSnackbar(result, "error");
      }
    } catch (error) {
      console.log(comments.VERIFY_OTP_FE_FAIL, error);
      showSnackbar(error as string, "error");
    }
  };

  const handleResendOtp = async () => {
    try {
      if (!userInfo || !userInfo.email) {
        showSnackbar("User information is missing", "error");
        return;
      }

      await axiosInstance.delete(`${API.USER_DELETE}/${userInfo.email}`);
      await dispatch(sendOTP(userInfo as IUser)).unwrap();

      setTimeLeft(60);
      setIsTimerActive(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.log(comments.OTP_RESND_FAIL, error);
      showSnackbar(error as string, "error");
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
          <button type="submit" disabled={loading}>
            {loading ? (
              <l-hourglass
                size="20"
                bg-opacity="0.1"
                speed="1.75"
                color="black"
              ></l-hourglass>
            ) : (
              "Verify OTP"
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="resend-otp-button"
          >
            {loading ? (
              <l-hourglass
                size="20"
                bg-opacity="0.1"
                speed="1.75"
                color="black"
              ></l-hourglass>
            ) : (
              "Resend OTP"
            )}
          </button>
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

export default OtpVerification;
