import { BellOffIcon } from "lucide-react";

const NoNotificationsFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-base-300 p-4 rounded-full mb-4">
        <BellOffIcon className="size-10 text-base-content opacity-70" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No notifications</h3>
      <p className="text-base-content opacity-70 max-w-md">
        You don't have any notifications at the moment. When you receive new notifications, they will appear here.
      </p>
    </div>
  );
};

export default NoNotificationsFound;