import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "../AuthModal/AuthModal";
import "./Header.scss";
import { AppRootState } from "../../../redux/store";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";

import { Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import ConfirmationModal from "../../common/Modal/ConfirmationModal/ConfirmationModal";
import { logout } from "../../../redux/thunks/userAuthServices";

type AuthModalType = "login" | "signup";

const Header: React.FC = () => {
  // Auth modal functions.
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<AuthModalType>("login");

  const openAuthModal = (type: AuthModalType) => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Profile menu functions.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, userInfo } = useAppSelector(
    (state: AppRootState) => state.user
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // logout function.
  const dispatch = useAppDispatch();
  const openLogoutModal = () => {
    setIsModalOpen(true);
  };
  const closeLogoutModal = () => {
    setIsModalOpen(false);
  };
  const handleLogoutConfirm = async () => {
    try {
      await dispatch(logout()).unwrap();
      closeLogoutModal();
    } catch (error) {
      console.log("logout error", error);
    }
  };
  const handleLogoutCancel = () => {
    console.log("Logout cancelled");
    closeLogoutModal();
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
              <MenuItem onClick={openLogoutModal}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialSection={authModalType}
      />
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeLogoutModal}
        onYes={handleLogoutConfirm}
        onNo={handleLogoutCancel}
        title="Confirm Logout"
        content="Are you sure you want to log out?"
      />
    </header>
  );
};

export default Header;
