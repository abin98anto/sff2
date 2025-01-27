import type React from "react";
import { useState } from "react";
import GoogleButton from "../google-btn/GoogleButton";
import { Eye, EyeOff } from "lucide-react";

interface UserLoginProps {
  userRole: "user" | "tutor";
  image: string;
}

const UserLogin: React.FC<UserLoginProps> = ({ userRole }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login submitted", formData);
  };

  return (
    <div className="auth-section">
      <h2>{userRole === "tutor" ? "Tutor Login" : "User Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit">
          {userRole === "tutor" ? "Login as Tutor" : "Login"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>
        <div className="google-signin-button">
          <GoogleButton />
          <span>Login with Google</span>
        </div>
      </form>
    </div>
  );
};

export default UserLogin;
