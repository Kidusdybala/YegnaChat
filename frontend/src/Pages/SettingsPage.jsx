import ThemeSelector from "../components/ThemeSelector";
import { Link } from "react-router-dom";

export const SettingsPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body space-y-6">

          <div>
            <h2 className="card-title mb-4">Account</h2>
            <Link
              to="/editprofile"
              className="flex items-center justify-between p-4 rounded-lg bg-base-100 hover:bg-base-300 transition"
            >
              <span>Edit Profile</span>
              <span className="text-lg">›</span> {/* Arrow icon */}
            </Link>
            <div>
            <h2 className="card-title mb-4">Theme</h2>
            <ThemeSelector />
          </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
