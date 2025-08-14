import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageCircle, Bell, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userAPI, chatAPI } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const MobileBottomNav = () => {
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
  
  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: () => chatAPI.getUnreadMessagesCount(),
    enabled: !!authUser,
  });
  
  // Count of unread messages
  const unreadMessagesCount = unreadMessages?.count || 0;
  
  // Hide mobile nav on individual chat pages (but show on /chat list)
  const isChatConversation = currentPath.startsWith('/chat/');
  if (isChatConversation) {
    return null;
  }

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Home",
      count: 0
    },
    {
      path: "/friends",
      icon: Users,
      label: "Friends",
      count: friendRequestCount
    },
    {
      path: "/chat",
      icon: MessageCircle,
      label: "Chats",
      count: unreadMessagesCount
    },
    {
      path: "/notifications",
      icon: Bell,
      label: "Notifications",
      count: notificationCount
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
      count: 0
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-200 border-t border-base-300 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === "/" 
            ? currentPath === "/" 
            : currentPath.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-3 py-2 min-w-0 relative ${
                isActive 
                  ? "text-primary" 
                  : "text-base-content/60 hover:text-base-content"
              } transition-colors duration-200`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform duration-200`} />
                {item.count > 0 && (
                  <div className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.count > 99 ? "99+" : item.count}
                  </div>
                )}
              </div>
              <span className={`text-xs mt-1 truncate max-w-full ${
                isActive ? "font-medium" : ""
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;