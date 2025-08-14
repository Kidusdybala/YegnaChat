import { BellOffIcon } from "lucide-react";

const NoNotificationsFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      <div className="bg-base-300 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
        <BellOffIcon className="w-8 h-8 sm:w-10 sm:h-10 text-base-content opacity-70" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2">No notifications</h3>
      <p className="text-sm sm:text-base text-base-content opacity-70 max-w-sm sm:max-w-md">
        You don't have any notifications at the moment. When you receive new notifications, they will appear here.
      </p>
    </div>
  );
};

export default NoNotificationsFound;