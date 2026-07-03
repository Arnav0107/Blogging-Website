import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import SideNav from "../components/sidenavbar.component";

const Dashboard = () => {
  const { userAuth } = useContext(UserContext);

  if (!userAuth) return null;
  if (!userAuth.access_token) return <Navigate to="/signin" />;

  return (
    <div className="relative flex max-[1100px]:flex-col">
      <SideNav />
      {/* ✅ mt-[65px] for navbar height, ml-[250px] for sidebar width */}
      <div className="flex-1 px-10 py-10 ml-[250px] mt-[65px] max-[1100px]:ml-0 max-[1100px]:mt-8 max-[1100px]:px-5">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;