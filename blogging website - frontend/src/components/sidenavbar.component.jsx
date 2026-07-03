import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const SideNav = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  const page = location.pathname.split("/")[2];

  const handleSignOut = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
    navigate("/signin");
  };

  const navLinks = [
    {
      section: "Dashboard",
      links: [
        { label: "Blogs", path: "blogs", icon: "fi-rr-document" },
        { label: "Notifications", path: "notifications", icon: "fi-rr-bell" },
        {
          label: "Write",
          path: "/editor",
          icon: "fi-rr-file-edit",
          external: true,
        },
      ],
    },
    {
      section: "Settings",
      links: [
        { label: "Edit Profile", path: "edit-profile", icon: "fi-rr-user" },
        {
          label: "Change Password",
          path: "change-password",
          icon: "fi-rr-lock",
        },
      ],
    },
  ];

  return (
    // ✅ add top-[65px] and adjust height
    <div className="fixed top-[65px] left-0 z-30 h-[calc(100vh-65px)] w-[250px] border-r border-grey bg-white pt-10 pl-0 overflow-y-auto max-[1100px]:hidden">
      {navLinks.map(({ section, links }) => (
        <div key={section} className="mb-8 pl-6">
          <p className="text-xs font-semibold uppercase text-dark-grey tracking-widest mb-4">
            {section}
          </p>

          {links.map(({ label, path, icon, external }) => {
            const isActive = !external && page === path;
            const to = external ? path : `/dashboard/${path}`;

            return (
              <Link
                key={path}
                to={to}
                className={`flex items-center gap-3 py-3 pl-4 pr-6 capitalize transition-all duration-200 rounded-l-full mb-1
                  ${
                    isActive
                      ? "bg-grey text-black font-medium"
                      : "text-dark-grey hover:bg-grey/50 hover:text-black"
                  }`}
              >
                <i className={`fi ${icon} text-xl leading-none`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      <div className="pl-6">
        <hr className="border-grey my-4 mr-6" />

        {/* User info */}
        <div className="flex items-center gap-3 mt-4 pr-6">
          <img
            src={userAuth?.profile_img}
            alt={userAuth?.fullname}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{userAuth?.fullname}</p>
            <p className="text-dark-grey text-xs truncate">
              @{userAuth?.username}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-dark-grey hover:text-black mt-6 py-2 capitalize"
        >
          <i className="fi fi-rr-sign-out text-xl leading-none" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default SideNav;
