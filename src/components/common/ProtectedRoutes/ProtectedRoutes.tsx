import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../redux/store";

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = "/",
}) => {
  const userInfo = useSelector((state: AppRootState) => state.user.userInfo);

  if (!userInfo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(userInfo.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
