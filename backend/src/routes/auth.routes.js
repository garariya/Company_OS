import express from "express";
import {
  signup,
  login,
  profile,
  refresh,
  logout
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.get("/profile", authMiddleware, profile);

export default router;