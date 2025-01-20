import React from "react";
import GoogleButton from "../google-btn/GoogleButton";

const UserLogin: React.FC = () => {
  return (
    <div className="auth-section">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Log In</button>

        <div className="divider">
          <span>or</span>
        </div>
        <div className="google-signin-button">
          <GoogleButton /> <p>Login with Google</p>
        </div>
      </form>
    </div>
  );
};

export default UserLogin;
