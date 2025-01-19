import React from "react";

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
      </form>
    </div>
  );
};

export default TutorSignup;
