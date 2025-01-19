import React from "react";

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
      </form>
    </div>
  );
};

export default TutorLogin;
