import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "../AuthModal/AuthModal";
import "./Header.scss";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "signup">(
    "login"
  );

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openAuthModal = (type: "login" | "signup") => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
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
              <button
                className="user-auth-link"
                onClick={() => openAuthModal("login")}
              >
                Login
              </button>
              <button
                className="user-auth-link"
                onClick={() => openAuthModal("signup")}
              >
                Sign Up
              </button>
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
          <button
            className="user-auth-link"
            onClick={() => openAuthModal("login")}
          >
            Login
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialSection={authModalType === "login" ? "userLogin" : "userSignup"}
      />
    </header>
  );
};

export default Header;
