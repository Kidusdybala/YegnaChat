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
    console.log(` Generating Stream token for user: ${req.user.id}`);
    const token = generateStreamToken(req.user.id);
    if (!token) {
      console.log(" Failed to generate Stream token - returning fallback");
      return res.status(500).json({
        message: "Stream Chat not available",
        fallback: true
      });
    }
    console.log(` Stream token generated successfully for user: ${req.user.id}`);
    res.status(200).json({ token });
  } catch (error) {
    console.log(" Error in getStreamToken controller", error.message);
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

    console.log(` Creating chat between ${currentUserId} and ${userId}`);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if users are friends
    const currentUser = await User.findById(currentUserId);
    console.log(` Current user friends:`, currentUser.friends);
    console.log(`🤝 Checking if ${userId} is in friends list:`, currentUser.friends.includes(userId));

    if (!currentUser.friends.includes(userId)) {
      console.log(` Users are not friends. Current user: ${currentUserId}, Target user: ${userId}`);
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
    console.log("Error in createOrGetStreamChat controller", error.message);
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
    console.log("Error in uploadMedia controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Simple chat functions (fallback when Stream is not available)
export async function createOrGetChat(req, res) {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    console.log(`💬 Creating simple chat between ${currentUserId} and ${userId}`);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if users are friends
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.friends.includes(userId)) {
      console.log(` Users are not friends. Current user: ${currentUserId}, Target user: ${userId}`);
      return res.status(403).json({ message: "You can only chat with friends. Please send and accept a friend request first." });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('participants', 'fullName profilePic');

    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, userId]
      });
      chat = await Chat.findById(chat._id).populate('participants', 'fullName profilePic');
    }

    console.log(` Chat created/found: ${chat._id}`);
    res.status(200).json({ chat });
  } catch (error) {
    console.log("Error in createOrGetChat controller", error.message);
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

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'fullName profilePic')
      .sort({ createdAt: 1 })
      .limit(50);

    res.status(200).json({ messages });
  } catch (error) {
    console.log("Error in getChatMessages controller", error.message);
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

    const message = await Message.create({
      chat: chatId,
      sender: currentUserId,
      content
    });

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName profilePic');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserChats(req, res) {
  try {
    const currentUserId = req.user.id;

    const chats = await Chat.find({
      participants: currentUserId
    })
    .populate('participants', 'fullName profilePic')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json({ chats });
  } catch (error) {
    console.log("Error in getUserChats controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Add this function to your existing chat.controller.js file

export async function getMessagesBetweenUsers(req, res) {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user.id;
    
    // Find or create a chat between these users
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, targetUserId] }
    });
    
    if (!chat) {
      // Create a new chat if it doesn't exist
      chat = await Chat.create({
        participants: [currentUserId, targetUserId]
      });
    }
    
    // Get messages for this chat
    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName profilePic');
    
    // Format messages for the frontend
    const formattedMessages = messages.map(msg => ({
      senderId: msg.sender._id,
      content: msg.content,
      timestamp: msg.createdAt
    }));
    
    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error in getMessagesBetweenUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}