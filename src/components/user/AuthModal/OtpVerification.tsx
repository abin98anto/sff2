import React, { useRef } from "react";

const OtpVerification: React.FC = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, value: string) => {
    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="auth-section">
      <h2>OTP Verification</h2>
      <form>
        <div className="otp-inputs">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleInput(index, e.target.value)}
            />
          ))}
        </div>
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
};

export default OtpVerification;
