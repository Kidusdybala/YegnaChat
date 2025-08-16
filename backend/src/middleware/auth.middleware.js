import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Add `.js` if you're using ES Modules

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    // Debug logging for mobile issues
    console.log("🍪 Cookies received:", req.cookies);
    console.log("🔑 JWT token:", token ? "Present" : "Missing");
    console.log("📱 User-Agent:", req.headers['user-agent']);

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
