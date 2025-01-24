import React from "react";
import GoogleButton from "../google-btn/GoogleButton";

interface TutorLoginProps {
  heading: string;
}

const TutorLogin: React.FC<TutorLoginProps> = ({ heading }) => {
  return (
    <div className="auth-section">
      <h2>{heading}</h2>
      <form>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Log In</button>

        <div className="divider">
          <span>or</span>
        </div>
        <div className="google-signin-button">
          <GoogleButton /> <span>Login with Google</span>
        </div>
      </form>
    </div>
  );
};

export default TutorLogin;
