import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendReqs,
  getFriendUsers,
  cancelFriendRequest,
  getUserById
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getRecommendedUsers);
router.get("/friend", getFriendUsers);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.delete("/friend-request/:id", cancelFriendRequest);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.get("/:id", protectRoute, getUserById);
export default router;
