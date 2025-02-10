import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "../AuthModal/AuthModal";
import "./Header.scss";
import { AppRootState } from "../../../redux/store";
import { useAppSelector } from "../../../hooks/reduxHooks";

import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  // Dialog,
  // DialogActions,
  // DialogTitle,
  // Button,
} from "@mui/material";

type AuthModalType = "login" | "signup";

const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<AuthModalType>("login");

  const { isAuthenticated, userInfo } = useAppSelector(
    (state: AppRootState) => state.user
  );

  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // const toggleMenu = () => {
  //   setIsMenuOpen(!isMenuOpen);
  // };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const openAuthModal = (type: AuthModalType) => {
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

        {!isAuthenticated || !userInfo ? (
          <div className="user-auth">
            <button
              className="user-auth-link"
              onClick={() => openAuthModal("login")}
            >
              Login
            </button>
          </div>
        ) : (
          <div>
            {" "}
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar
                src={userInfo?.picture ?? undefined}
                alt={userInfo?.name || "User"}
                sx={{
                  width: 40,
                  height: 40,
                  border: "2px solid #primary.main",
                }}
              >
                {userInfo?.name?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <Link
                  to="/profile"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Profile
                </Link>
              </MenuItem>
              <MenuItem onClick={() => console.log("logout clicked")}>
                Logout
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialSection={authModalType}
      />
    </header>
  );
};

export default Header;
