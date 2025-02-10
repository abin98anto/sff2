import { useState } from "react";
import {
  BarChart2,
  // Users,
  // MessageCircleMore,
  // CircleUserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import Modal from "../../common/Modal/Modal";
import { logout } from "../../../redux/thunks/userAuthServices";
import "./TutorSidebar.scss";

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart2,
    path: "/tutor",
  },
  // {
  //   title: "My Students",
  //   icon: Users,
  //   path: "/tutor/my-students",
  // },
  // {
  //   title: "Messages",
  //   icon: MessageCircleMore,
  //   path: "/tutor/messages",
  // },
  // {
  //   title: "Profile",
  //   icon: CircleUserRound,
  //   path: "/tutor/profile",
  // },
];

export const TutorSidebar = () => {
  const dispatch = useAppDispatch();
  const [isCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    console.log("Logout cancelled");
    closeLogoutModal();
  };

  return (
    <>
      <div className={`tutor-sidebar ${isCollapsed ? "tutor-collapsed" : ""}`}>
        <div className="tutor-sidebar-header">
          <h1 className="tutor-logo">SkillForge</h1>
        </div>

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

        <div className="tutor-sidebar-footer">
          <button className="tutor-sign-out-button" onClick={openLogoutModal}>
            Logout
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeLogoutModal}
        onYes={handleLogoutConfirm}
        onNo={handleLogoutCancel}
        title="Confirm Logout"
        content="Are you sure you want to log out?"
      />
    </>
  );
};
