import React from "react";
import GoogleButton from "../google-btn/GoogleButton";

const TutorSignup: React.FC = () => {
  return (
    <div className="auth-section">
      <h2>Tutor Sign Up</h2>
      <form>
        <input type="text" placeholder="Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <input type="password" placeholder="Confirm Password" required />
        <button type="submit">Sign Up</button>
        
        <div className="divider">
          <span>or</span>
        </div>
        <div className="google-signin-button">
          <GoogleButton /> <p>Sign in with Google</p>
        </div>
      </form>
    </div>
  );
};

export default TutorSignup;
