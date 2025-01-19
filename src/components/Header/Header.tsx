import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="user-header">
      <div className="user-container">
        <Link to="/" className="user-logo">
          SkillForge
        </Link>

        {/* Hamburger Menu Icon */}
        <div
          className={`user-hamburger ${isMenuOpen ? "user-open" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Mobile Menu */}
        <div className={`user-mobile-menu ${isMenuOpen ? "user-active" : ""}`}>
          <div className="user-mobile-menu-content">
            <button className="user-close-menu" onClick={toggleMenu}>
              &times;
            </button>
            <nav className="user-mobile-nav">
              <ul>
                <li>
                  <Link to="/courses" onClick={toggleMenu}>
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/subscriptions" onClick={toggleMenu}>
                    Subscriptions
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile Authentication Section */}
            <div className="user-mobile-auth">
              <Link to="/login" className="user-login" onClick={toggleMenu}>
                Login
              </Link>
              <Link to="/signup" className="user-signup" onClick={toggleMenu}>
                Signup
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="user-nav">
          <ul>
            <li>
              <Link to="/courses">Courses</Link>
            </li>
            <li>
              <Link to="/subscriptions">Subscriptions</Link>
            </li>
          </ul>
        </nav>

        <div className="user-auth">
          <Link to="/login" className="user-login">
            Login →
          </Link>
          <Link to="/signup" className="user-signup">
            Signup
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
