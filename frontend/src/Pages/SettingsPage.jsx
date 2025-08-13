import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../constants";
import useAuthUser from "../hooks/useAuthUser";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import { 
  User, 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  ChevronRight, 
  Bell, 
  Shield, 
  HelpCircle,
  Info,
  Check,
  LogOut
} from "lucide-react";

const SettingsPage = () => {
  const { theme, changeTheme } = useTheme();
  const { logout, isLoggingOut } = useAuthUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getThemeIcon = (themeName) => {
    if (themeName === 'light') return <Sun className="w-4 h-4" />;
    if (themeName === 'dark' || themeName === 'night') return <Moon className="w-4 h-4" />;
    return <Palette className="w-4 h-4" />;
  };

  const getCurrentTheme = () => {
    return THEMES.find(t => t.name === theme) || THEMES[0];
  };

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
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Settings</h1>
          <p className="text-base-content/70">Customize your YegnaChat experience</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-primary" />
                <h2 className="card-title text-base-content">Account Settings</h2>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/editprofile"
                  className="flex items-center justify-between p-4 rounded-lg bg-base-100 hover:bg-base-300 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-base-content/70" />
                    <div>
                      <span className="font-medium text-base-content">Edit Profile</span>
                      <p className="text-sm text-base-content/60">Update your profile information</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-base-content/50 group-hover:text-base-content/80 transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-primary" />
                <h2 className="card-title text-base-content">Appearance</h2>
              </div>
              
              {/* Current Theme Display */}
              <div className="mb-6 p-4 rounded-lg bg-base-100 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  {getThemeIcon(theme)}
                  <span className="font-medium text-base-content">Current Theme: {getCurrentTheme().label}</span>
                </div>
                <div className="flex gap-2">
                  {getCurrentTheme().colors.slice(0, 4).map((color, index) => (
                    <div 
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-base-content/20 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {THEMES.slice(0, 12).map((themeOption) => (
                  <button
                    key={themeOption.name}
                    onClick={() => changeTheme(themeOption.name)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      theme === themeOption.name
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-base-300 bg-base-100 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium text-sm ${
                        theme === themeOption.name ? 'text-primary' : 'text-base-content'
                      }`}>
                        {themeOption.label}
                      </span>
                      {theme === themeOption.name && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex gap-1">
                      {themeOption.colors.slice(0, 4).map((color, index) => (
                        <div 
                          key={index}
                          className="w-4 h-4 rounded-full border border-base-content/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Show More Themes Button */}
              <details className="collapse collapse-arrow bg-base-100 mt-4">
                <summary className="collapse-title text-base font-medium">
                  Show More Themes ({THEMES.length - 12} more)
                </summary>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                    {THEMES.slice(12).map((themeOption) => (
                      <button
                        key={themeOption.name}
                        onClick={() => changeTheme(themeOption.name)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          theme === themeOption.name
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-base-300 bg-base-100 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium text-sm ${
                            theme === themeOption.name ? 'text-primary' : 'text-base-content'
                          }`}>
                            {themeOption.label}
                          </span>
                          {theme === themeOption.name && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          {themeOption.colors.slice(0, 4).map((color, index) => (
                            <div 
                              key={index}
                              className="w-4 h-4 rounded-full border border-base-content/20"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Other Settings */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-6 h-6 text-primary" />
                <h2 className="card-title text-base-content">Other Settings</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-base-100">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-base-content/70" />
                    <div>
                      <span className="font-medium text-base-content">Notifications</span>
                      <p className="text-sm text-base-content/60">Manage notification preferences</p>
                    </div>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-base-100">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-base-content/70" />
                    <div>
                      <span className="font-medium text-base-content">Privacy</span>
                      <p className="text-sm text-base-content/60">Control your privacy settings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-base-content/50" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-base-100">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-base-content/70" />
                    <div>
                      <span className="font-medium text-base-content">Help & Support</span>
                      <p className="text-sm text-base-content/60">Get help with YegnaChat</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-base-content/50" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-base-100">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-base-content/70" />
                    <div>
                      <span className="font-medium text-base-content">About</span>
                      <p className="text-sm text-base-content/60">App version and information</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-base-content/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <LogOut className="w-6 h-6 text-error" />
                <h2 className="card-title text-base-content">Account Actions</h2>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleLogoutClick}
                  disabled={isLoggingOut}
                  className="flex items-center justify-between p-4 rounded-lg bg-base-100 hover:bg-error/10 transition-colors duration-200 group w-full border-2 border-transparent hover:border-error/20"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-error" />
                    <div className="text-left">
                      <span className="font-medium text-error">Logout</span>
                      <p className="text-sm text-base-content/60">Sign out of your account</p>
                    </div>
                  </div>
                  {isLoggingOut ? (
                    <span className="loading loading-spinner loading-sm text-error"></span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-error/50 group-hover:text-error transition-colors" />
                  )}
                </button>
              </div>
            </div>
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
    </div>
  );
};

export default SettingsPage;
