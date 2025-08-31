import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

let streamClient = null;

if (apiKey && apiSecret) {
  // Validate API key format (Stream API keys are typically 12 characters)
  if (apiKey.length < 10) {
    console.error(" Stream API key appears to be invalid (too short)");
  } else {
    // Use the correct class name
    streamClient = StreamChat.getInstance(apiKey, apiSecret);
  }
} else {
  console.warn("Stream API credentials not configured. Stream Chat features will be disabled.");
}

export const upsertStreamUser = async (userData) => {
  if (!streamClient) {
    console.warn("Stream client not available. Skipping user upsert.");
    return userData;
  }
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error(`Error upserting user ${userData.id}:`, error);
  }
};

export const generateStreamToken = (userId) => {
  if (!streamClient) {
    console.warn("Stream client not available. Cannot generate token.");
    return null;
  }
  try {
    const userIdStr = userId.toString();
    const token = streamClient.createToken(userIdStr);
    return token;
  } catch (error) {
    console.error(" Error generating token:", error);
    return null;
  }
};
