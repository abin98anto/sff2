import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../redux/store";

const ProtectedRoute = () => {
  const userInfo = useSelector((state: AppRootState) => state.user.userInfo);
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
  const where = currentUrl.split("/")[3] === "admin" ? "admin" : "";

  return userInfo ? <Outlet /> : <Navigate to={`/${where}`} />;
};

export default ProtectedRoute;
