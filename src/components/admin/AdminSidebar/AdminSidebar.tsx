import "./AdminSidebar.scss";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2,
  BookOpen,
  //   Users,
  //   UserCog,
  //   Layers,
  //   BookCheck,
  SquareStack,
} from "lucide-react";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { logout } from "../../../redux/thunks/userAuthServices";
import ConfirmationModal from "../../common/Modal/ConfirmationModal/ConfirmationModal";

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
  //   { title: "Tutor Management", icon: UserCog, path: "/admin/tutor-management" },
  //   { title: "User Management", icon: Users, path: "/admin/user-management" },
  //   {
  //     title: "Subscription Management",
  //     icon: Layers,
  //     path: "/admin/batch-management",
  //   },
  //   { title: "Ledger", icon: BookCheck, path: "/admin/ledger" },
];

export default function AdminSidebar() {
  const dispatch = useAppDispatch();
  const [isCollapsed] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [showLogoutModal, setShowLogoutModal] = useState(false);
  //   const location = useLocation();

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
    navigate("/admin");
  };

  const handleLogoutCancel = () => {
    closeLogoutModal();
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? "admin-collapsed" : ""}`}>
      <div className="admin-sidebar-header">
        <h1 className="admin-logo">SkillForge</h1>
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeLogoutModal}
        onYes={handleLogoutConfirm}
        onNo={handleLogoutCancel}
        title="Confirm Logout"
        content="Are you sure you want to log out?"
      />
    </div>
  );
}
