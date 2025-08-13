import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../lib/api";

import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon, RefreshCw } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading, refetch } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: userAPI.getFriendRequests,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    refetchIntervalInBackground: false, // Only when tab is active
    staleTime: 5000, // Consider data fresh for 5 seconds
    retry: 2
  });
  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: userAPI.acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          <button 
            onClick={() => refetch()} 
            className="btn btn-sm btn-ghost btn-circle"
            disabled={isLoading}
            title="Refresh notifications"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300">
                              {request.sender?.profilePic ? (
                                <img src={request.sender.profilePic} alt={request.sender.fullName} />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full text-xl font-bold">
                                  {request.sender?.fullName?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.sender?.fullName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender?.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender?.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQS NOTIFICATIONS */}
            {acceptedRequests.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            {notification.recipient?.profilePic ? (
                              <img
                                src={notification.recipient.profilePic}
                                alt={notification.recipient?.fullName || 'User'}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-base-300 text-lg font-bold">
                                {notification.recipient?.fullName?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                            <span className="font-semibold">
                              {notification.receiver?.fullName || "Unknown User"}
                            </span>{" "}
has accepted your friend request


                            </p>
                            <p className="text-xs opacity-70 mt-1">
                              <ClockIcon className="inline-block size-3 mr-1" />
                              {new Date(notification.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;