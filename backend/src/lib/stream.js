import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("API key and secret are required");
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
    return streamClient.createToken(userId);
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
};
