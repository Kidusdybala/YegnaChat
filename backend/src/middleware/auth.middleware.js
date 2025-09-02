import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Add `.js` if you're using ES Modules

export const protectRoute = async (req, res, next) => {
  try {
    // Prefer cookie, but also accept Authorization: Bearer <token>
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = (req.cookies && req.cookies.jwt) ? req.cookies.jwt : bearerToken;

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
