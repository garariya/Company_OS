import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (user) => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  return jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role
  },
  secret,
  { expiresIn: "15m" });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({
    id: user.id,
    jti: crypto.randomBytes(16).toString("hex")
  },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "30d" });
};

export default generateAccessToken;