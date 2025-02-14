import "./AdminLogin.scss";

const AdminLogin = () => {
  return (
    <div className="admin-login-container">
      <div className="admin-login-overlay">
        <h1 className="admin-login-heading">SkillForge</h1>
        <div className="admin-login-form-container">
          <h1>Admin Login</h1>
          <form className="admin-login-form">
            <div className="admin-form-group">
              <input className="admin-login-input" placeholder="Email" />
            </div>
            <div className="admin-form-group">
              <input
                className="admin-login-input"
                placeholder="Password"
                type="password"
              />
            </div>
            <button className="admin-login-button" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
