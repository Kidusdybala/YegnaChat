import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    // For getRecommendedUsers
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, 
        { _id: { $nin: currentUser.friends } }, 
        { _id: { $nin: currentUser.blockedUsers } },
      ],
    })
    .limit(30) // Only return 10 users
    .select('fullName profilePic') // Only select needed fields
    .lean(); // Use lean for better performance
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: receiverId } = req.params;
    
    if (myId === receiverId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }
    
    // Check if already friends
    if (receiver.friends && receiver.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }
    
    // Check if a friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, receiver: receiverId },
        { sender: receiverId, receiver: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you and this user" });
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: myId,
      receiver: receiverId,
    });
    
    // Get sender info for notification
    const sender = await User.findById(myId).select('fullName');
    
    // Emit socket event for real-time notification
    // We'll access the io instance from the global scope
    const io = req.app.get('io');
    if (io) {
      // Get online users from the io instance
      const onlineUsers = req.app.get('onlineUsers');
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('getFriendRequest', {
          requestId: friendRequest._id,
          senderId: myId,
          senderName: sender.fullName
        });

      }
    }

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    if (friendRequest.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver },
    });

    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender },
    });
    
    // Get accepter info for notification
    const accepter = await User.findById(friendRequest.receiver).select('fullName');
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      // Get online users from the io instance
      const onlineUsers = req.app.get('onlineUsers');
      const senderSocketId = onlineUsers.get(friendRequest.sender.toString());
      
      if (senderSocketId) {
        io.to(senderSocketId).emit('getFriendAccepted', {
          requestId: friendRequest._id,
          accepterId: friendRequest.receiver,
          accepterName: accepter.fullName
        });

      }
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      receiver: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("receiver", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("receiver", "fullName profilePic");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function cancelFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const userId = req.user.id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Only sender can cancel the request
    if (friendRequest.sender.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to cancel this request" });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request canceled successfully" });
  } catch (error) {
    console.error("Error in cancelFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q: query } = req.query;
    const currentUserId = req.user.id;
    const currentUser = req.user;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search users by name (case-insensitive)
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { _id: { $nin: currentUser.blockedUsers } }, // Exclude blocked users
        { 
          fullName: { 
            $regex: query.trim(), 
            $options: 'i' 
          } 
        }
      ],
    })
    .select('fullName profilePic')
    .limit(20)
    .lean();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error in searchUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
