import type React from "react";
import { useRef, useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const OtpVerification: React.FC = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

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
    console.log("Verifying OTP:", otp.join(""));
  };

  const handleResendOtp = () => {
    console.log("Resending OTP");
    setTimeLeft(60);
    setIsTimerActive(true);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
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
          <button type="submit" disabled={otp.join("").length !== 6}>
            Verify OTP
          </button>
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
    </div>
  );
};

export default OtpVerification;
