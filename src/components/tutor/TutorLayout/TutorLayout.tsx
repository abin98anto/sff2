import { Outlet } from "react-router-dom";

import "./TutorLayout.scss";
import TutorSidebar from "../TutorSidebar/TutorSidebar";

const TutorLayout = () => {
  return (
    <div className="tutor-layout">
      <TutorSidebar />
      <div className="tutor-content">
        <Outlet />
      </div>
    </div>
  );
};

export default TutorLayout;
