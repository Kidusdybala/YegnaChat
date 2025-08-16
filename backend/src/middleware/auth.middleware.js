import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Add `.js` if you're using ES Modules

export const protectRoute = async (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.jwt;
    
    // Fallback for Chrome iOS - check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log("🤖 Using token from Authorization header (Chrome iOS fallback)");
      }
    }
    
    // Debug logging for mobile issues
    console.log("🍪 Cookies received:", req.cookies);
    console.log("🔑 JWT token:", token ? "Present" : "Missing");
    console.log("📱 User-Agent:", req.headers['user-agent']);
    console.log("🔐 Authorization header:", req.headers.authorization ? "Present" : "Missing");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password"); // Use `decoded.id`, not `decoded.userId`
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
