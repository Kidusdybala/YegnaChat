import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);
    if (!token) {
      return res.status(500).json({
        message: "Stream Chat not available",
        fallback: true
      });
    }
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({
      message: "Stream Chat not available",
      fallback: true
    });
  }
}

// Create or get a Stream chat channel
export async function createOrGetStreamChat(req, res) {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;



    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if users are friends
    const currentUser = await User.findById(currentUserId);


    if (!currentUser.friends.includes(userId)) {
      return res.status(403).json({ message: "You can only chat with friends. Please send and accept a friend request first." });
    }

    // Get user details for both participants
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create or update Stream users
    await upsertStreamUser({
      id: currentUserId,
      name: currentUser.fullName,
      image: currentUser.profilePic,
    });

    await upsertStreamUser({
      id: userId,
      name: otherUser.fullName,
      image: otherUser.profilePic,
    });

    // Create a unique channel ID by sorting user IDs
    const members = [currentUserId, userId].sort();
    const channelId = `messaging:${members.join('-')}`;

    res.status(200).json({
      channelId: channelId,
      otherUser: {
        id: otherUser._id,
        fullName: otherUser.fullName,
        profilePic: otherUser.profilePic
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Upload file for Stream chat
export async function uploadMedia(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the file URL
    const fileUrl = `/uploads/${file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Simple chat functions (fallback when Stream is not available)
export async function createOrGetChat(req, res) {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;


    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if users are friends
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.friends.includes(userId)) {
      return res.status(403).json({ message: "You can only chat with friends. Please send and accept a friend request first." });
    }

    // Find all chats between these users (there might be duplicates)
    const existingChats = await Chat.find({
      participants: { $all: [currentUserId, userId] }
    }).sort({ updatedAt: -1 });

    let chat;
    
    if (existingChats.length > 0) {
      // Use the most recent chat
      chat = existingChats[0];
      
      // If there are duplicates, clean them up
      if (existingChats.length > 1) {
        
        // Keep the first (most recent) chat and delete the rest
        const chatsToDelete = existingChats.slice(1).map(c => c._id);
        
        // Delete the duplicate chats
        await Chat.deleteMany({ _id: { $in: chatsToDelete } });
      }
    } else {
      // Create a new chat if none exists
      chat = await Chat.create({
        participants: [currentUserId, userId]
      });
    }
    
    // Populate the chat with participant details
    chat = await Chat.findById(chat._id).populate('participants', 'fullName profilePic');

    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id;

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(currentUserId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get messages
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'fullName profilePic')
      .sort({ createdAt: 1 })
      .limit(50);

    // Mark messages as read in the background
    // This won't block the response
    Message.updateMany(
      { 
        chat: chatId,
        sender: { $ne: currentUserId }, // Only mark messages from others as read
        readBy: { $ne: currentUserId } // Only update if not already read
      },
      { 
        $addToSet: { readBy: currentUserId },
        $set: { status: "read" }
      }
    ).then(result => {
    }).catch(err => {
      console.error("Error marking messages as read:", err);
    });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user.id;

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(currentUserId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Create the message with the sender automatically added to readBy
    const message = await Message.create({
      chat: chatId,
      sender: currentUserId,
      content,
      readBy: [currentUserId] // Sender has read their own message
    });

    // Update chat's last message and updatedAt timestamp
    await Chat.findByIdAndUpdate(chatId, { 
      lastMessage: message._id,
      updatedAt: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName profilePic');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserChats(req, res) {
  try {
    const currentUserId = req.user.id;

    // Get all chats for the current user
    let chats = await Chat.find({
      participants: currentUserId
    })
    .populate('participants', 'fullName profilePic')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'fullName profilePic'
      }
    })
    .sort({ updatedAt: -1 });

    
    // Check for duplicate chats and clean them up automatically
    const uniqueParticipantSets = new Map();
    const chatsToKeep = [];
    const chatsToDelete = [];
    
    // First pass: identify the most recent chat for each unique participant combination
    chats.forEach(chat => {
      // Create a unique key for each chat based on participant IDs
      const participantIds = chat.participants
        .map(p => p._id.toString())
        .sort()
        .join('-');
      
      if (!uniqueParticipantSets.has(participantIds)) {
        // This is the first (most recent) chat we've seen with these participants
        uniqueParticipantSets.set(participantIds, chat);
        chatsToKeep.push(chat);
      } else {
        // We already have a more recent chat with these participants
        chatsToDelete.push(chat._id);
      }
    });
    
    // If we found duplicates, delete them from the database
    if (chatsToDelete.length > 0) {
      await Chat.deleteMany({ _id: { $in: chatsToDelete } });
    }
    
    // Return only the unique chats
    res.status(200).json({ chats: chatsToKeep });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMessagesBetweenUsers(req, res) {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;

    // Find all chats between these users (there might be duplicates)
    const chats = await Chat.find({
      participants: { $all: [currentUserId, targetUserId] }
    }).sort({ updatedAt: -1 });

    if (!chats || chats.length === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // If there are multiple chats, use the most recent one
    const chat = chats[0];
    
    // If there are duplicates, clean them up
    if (chats.length > 1) {
      
      // Keep the first (most recent) chat and delete the rest
      const chatsToDelete = chats.slice(1).map(c => c._id);
      
      // Delete the duplicate chats
      await Chat.deleteMany({ _id: { $in: chatsToDelete } });
    }

    // Get messages for this chat
    const messages = await Message.find({ chat: chat._id })
      .populate('sender', 'fullName profilePic')
      .sort({ createdAt: 1 });
      
    // Mark messages as read in the background
    // This won't block the response
    Message.updateMany(
      { 
        chat: chat._id,
        sender: { $ne: currentUserId }, // Only mark messages from others as read
        readBy: { $ne: currentUserId } // Only update if not already read
      },
      { 
        $addToSet: { readBy: currentUserId },
        $set: { status: "read" }
      }
    ).then(result => {
    }).catch(err => {
      console.error("Error marking messages as read:", err);
    });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get unread messages count for the current user
export async function getUnreadMessagesCount(req, res) {
  try {
    const currentUserId = req.user.id;
    
    // Get all chats for the current user
    const userChats = await Chat.find({
      participants: currentUserId
    });
    
    const chatIds = userChats.map(chat => chat._id);
    
    // Find all messages in these chats where the current user is not in the readBy array
    const unreadMessages = await Message.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: currentUserId }, // Don't count messages sent by the current user
      readBy: { $ne: currentUserId } // Current user hasn't read the message
    });
    
    
    res.status(200).json({ count: unreadMessages });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Mark messages as read
export async function markMessagesAsRead(req, res) {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.id;
    
    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(currentUserId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Mark all messages in this chat as read by the current user
    const updateResult = await Message.updateMany(
      { 
        chat: chatId,
        sender: { $ne: currentUserId }, // Only mark messages from others as read
        readBy: { $ne: currentUserId } // Only update if not already read
      },
      { 
        $addToSet: { readBy: currentUserId },
        $set: { status: "read" }
      }
    );
    
    
    res.status(200).json({ 
      message: `Marked ${updateResult.modifiedCount} messages as read`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}
