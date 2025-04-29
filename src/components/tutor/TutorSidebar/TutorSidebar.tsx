import { useState } from "react";
import { BarChart2, Users, CircleUserRound, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./TutorSidebar.scss";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { logout } from "../../../redux/thunks/user/userAuthServices";
import CustomModal from "../../common/Modal/CustomModal/CustomModal";
import API from "../../../shared/constants/API";

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart2,
    path: API.TUTOR_DASHBOARD,
  },
  {
    title: "My Students",
    icon: Users,
    path: API.TUTOR_STUDENTS,
  },
  {
    title: "Profile",
    icon: CircleUserRound,
    path: API.TUTOR_PROFILE,
  },
  {
    title: "My Courses",
    icon: BookOpen,
    path: "/tutor/my-courses",
  },
];

const menuItemsUnverified = [
  {
    title: "Profile",
    icon: CircleUserRound,
    path: API.TUTOR_PROFILE,
  },
];

const TutorSidebar = () => {
  const dispatch = useAppDispatch();
  const [isCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userInfo } = useAppSelector((state) => state.user);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const openLogoutModal = () => {
    setIsModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsModalOpen(false);
  };

  const handleLogoutConfirm = async () => {
    closeLogoutModal();
    await dispatch(logout());
    navigate("/");
  };

  const handleLogoutCancel = () => {
    closeLogoutModal();
  };

  return (
    <>
      <div className={`tutor-sidebar ${isCollapsed ? "tutor-collapsed" : ""}`}>
        <div className="tutor-sidebar-header">
          <h1 className="tutor-logo">SkillForge</h1>
        </div>

        {userInfo?.isVerified ? (
          <nav className="tutor-sidebar-nav">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`tutor-nav-item ${isActive ? "tutor-active" : ""}`}
                >
                  <item.icon className="tutor-nav-icon" />
                  <span className="tutor-nav-text">{item.title}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="tutor-sidebar-nav">
            {menuItemsUnverified.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`tutor-nav-item ${isActive ? "tutor-active" : ""}`}
                >
                  <item.icon className="tutor-nav-icon" />
                  <span className="tutor-nav-text">{item.title}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="tutor-sidebar-footer">
          <button className="tutor-sign-out-button" onClick={openLogoutModal}>
            Logout
          </button>
        </div>
      </div>

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
    </>
  );
};

export default TutorSidebar;
