import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../lib/api";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  // Fetch friend requests for the badge
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: userAPI.getFriendRequests,
  });

  // Count of incoming friend requests
  const friendRequestCount = friendRequests?.incomingReqs?.length || 0;

  // Fetch notifications (accepted friend requests)
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: userAPI.getFriendRequests,
  });

  // Count of notifications (accepted friend requests)
  const notificationCount = notifications?.acceptedReqs?.length || 0;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-1">
          <img 
            src="/Logo.png" 
            alt="YegnaChat Logo" 
            className="w-10 h-10 object-contain" 
          />
          <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wide">
            YegnaChat
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
          {friendRequestCount > 0 && (
            <div className="badge badge-sm badge-error text-white ml-auto">{friendRequestCount}</div>
          )}
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
          {notificationCount > 0 && (
            <div className="badge badge-sm badge-error text-white ml-auto">{notificationCount}</div>
          )}
        </Link>

        <Link
          to="/settings"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/settings" ? "btn-active" : ""
          }`}
        >
          <Settings className="size-5 text-base-content opacity-70" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;