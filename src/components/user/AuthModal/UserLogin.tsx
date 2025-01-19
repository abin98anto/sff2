import React from "react";

const UserLogin: React.FC = () => {
  return (
    <div className="auth-section">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default UserLogin;
