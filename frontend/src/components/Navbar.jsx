import { Link } from "react-router-dom";
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import { getProfilePictureUrl } from "../utils/imageUtils";
import LogoutConfirmModal from "./LogoutConfirmModal";

const Navbar = () => {
  const { authUser, logout, isLoggingOut } = useAuthUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const profilePicUrl = getProfilePictureUrl(authUser);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-14 md:h-16 flex items-center safe-area-inset-top">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Mobile - Show logo on small screens */}
          <div className="flex items-center lg:hidden">
            <Link to="/" className="flex items-center gap-2 touch-target">
              <img 
                src="/Logo.png" 
                alt="YegnaChat" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain" 
              />
              <span className="text-base sm:text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                YegnaChat
              </span>
            </Link>
          </div>

          {/* Desktop - Empty space for sidebar logo */}
          <div className="hidden lg:block flex-1"></div>

          {/* Right side - User controls (always on the right) */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle touch-target min-h-[44px] min-w-[44px] hover:bg-base-300 transition-colors">
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <Link to="/editprofile" className="touch-target">
              <div className="avatar">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-transparent hover:ring-primary transition-all duration-200">
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt="User Avatar"
                      className="rounded-full object-cover w-full h-full"
                      onError={(e) => {
                        console.warn('Profile picture failed to load:', profilePicUrl);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-focus flex items-center justify-center text-primary-content font-semibold text-sm sm:text-base shadow-md"
                    style={{ display: profilePicUrl ? 'none' : 'flex' }}
                  >
                    {authUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
              </div>
            </Link>

            {/* Logout button */}
            <button
              className="btn btn-ghost btn-circle touch-target min-h-[44px] min-w-[44px] hover:bg-base-300 transition-colors"
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              title="Logout"
            >
              {isLoggingOut ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        isLoggingOut={isLoggingOut}
      />
    </nav>
  );
};
export default Navbar;