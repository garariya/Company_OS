import express from "express";

import {
  createConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage
} from "../controllers/chat.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/conversation",
  authMiddleware,
  createConversation
);

router.get(
  "/conversations",
  authMiddleware,
  getMyConversations
);

router.get(
  "/conversations/:id/messages",
  authMiddleware,
  getConversationMessages
);

router.post(
  "/messages",
  authMiddleware,
  sendMessage
);

export default router;