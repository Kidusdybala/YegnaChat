import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error(" Stream API key and secret are required");
  console.error("Please set STREAM_API_KEY and STREAM_API_SECRET in your .env file");
  throw new Error("Stream API credentials not configured");
}

// Validate API key format (Stream API keys are typically 12 characters)
if (apiKey.length < 10) {
  console.error(" Stream API key appears to be invalid (too short)");
  throw new Error("Invalid Stream API key format");
}

// Use the correct class name
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error(`Error upserting user ${userData.id}:`, error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    const token = streamClient.createToken(userIdStr);
    return token;
  } catch (error) {
    console.error(" Error generating token:", error);
    return null;
  }
};
