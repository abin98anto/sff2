import { Outlet } from "react-router-dom";
import "./UserLayout.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const UserLayout = () => {
  return (
    <div className="user-layout">
      <Header />
      <main className="user-content" style={{ flex: "1" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
