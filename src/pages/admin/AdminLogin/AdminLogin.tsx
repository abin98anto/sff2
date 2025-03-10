import { useNavigate } from "react-router-dom";
import UserLogin from "../../../components/user/AuthModal/UserLogin";
import "./AdminLogin.scss";

const AdminLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-login-container">
      <div className="admin-login-overlay">
        <h1 className="admin-login-heading">SkillForge</h1>
        <div className="admin-login-form-container">
          <UserLogin
            userRole="admin"
            image=""
            onClose={() => navigate("/admin/dashboard")}
            onForgotPassword={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
