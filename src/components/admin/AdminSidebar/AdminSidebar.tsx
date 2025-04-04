import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  BookOpen,
  Layers,
  Users,
  UserCog,
  SquareStack,
} from "lucide-react";

import "./AdminSidebar.scss";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { logout } from "../../../redux/thunks/user/userAuthServices";
import CustomModal from "../../common/Modal/CustomModal/CustomModal";

const menuItems = [
  { title: "Dashboard", icon: BarChart2, path: "/admin/dashboard" },
  {
    title: "Category Management",
    icon: SquareStack,
    path: "/admin/category-management",
  },
  {
    title: "Course Management",
    icon: BookOpen,
    path: "/admin/course-management",
  },
  {
    title: "Subscription Management",
    icon: Layers,
    path: "/admin/subscription-management",
  },
  { title: "User Management", icon: Users, path: "/admin/user-management" },
  { title: "Tutor Management", icon: UserCog, path: "/admin/tutor-management" },
];

const AdminSidebar = () => {
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
    navigate("/admin");
  };

  const handleLogoutCancel = () => {
    closeLogoutModal();
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? "admin-collapsed" : ""}`}>
      <div className="admin-sidebar-header">
        <h1 className="admin-logo" onClick={toggleSidebar}>
          SkillForge
        </h1>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`admin-nav-item ${isActive ? "admin-active" : ""}`}
            >
              <item.icon className="admin-nav-icon" />
              <span className="admin-nav-text">{item.title}</span>
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-sign-out-button" onClick={openLogoutModal}>
          Logout
        </button>
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
    </div>
  );
};

export default AdminSidebar;
