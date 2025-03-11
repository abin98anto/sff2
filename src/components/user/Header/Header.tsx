import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Menu, MenuItem, IconButton } from "@mui/material";

import "./Header.scss";
import { AppRootState } from "../../../redux/store";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import AuthModal from "../AuthModal/AuthModal";
import { logout } from "../../../redux/thunks/user/userAuthServices";
import CustomModal from "../../common/Modal/CustomModal/CustomModal";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";

type AuthModalType = "login" | "signup";

const Header: React.FC = () => {
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
  const navigate = useNavigate();
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

  useEffect(() => {
    if (userInfo?.role === "admin") {
      navigate(API.ADMIN_DASH);
    } else if (userInfo?.role === "tutor") {
      navigate(API.TUTOR_DASHBOARD);
    }
  }, [userInfo]);

  // logout function.
  const dispatch = useAppDispatch();
  const openLogoutModal = () => {
    setIsModalOpen(true);
    handleProfileMenuClose();
  };
  const closeLogoutModal = () => {
    setIsModalOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await dispatch(logout()).unwrap();
      closeLogoutModal();
    } catch (error) {
      console.log(comments.LOGOUT_ERR, error);
    }
  };
  const handleLogoutCancel = () => {
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
              <Link to={API.COURSES}>Courses</Link>
            </li>
            {userInfo && (
              <li>
                <Link to={API.MY_LEARNING}>My Learning</Link>
              </li>
            )}
            <li>
              <Link to={API.SUBSCRIPIIONS}>Subscriptions</Link>
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
      <CustomModal
        isOpen={isModalOpen}
        onClose={closeLogoutModal}
        header="Confirm Logout"
        buttons={[
          {
            text: "Yes",
            onClick: handleLogoutConfirm,
            variant: "secondary",
          },
          {
            text: "No",
            onClick: handleLogoutCancel,
            variant: "primary",
          },
        ]}
      >
        <p>Are you sure you want to log out?</p>
      </CustomModal>
    </header>
  );
};

export default Header;
