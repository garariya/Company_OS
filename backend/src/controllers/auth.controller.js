import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import generateAccessToken, { generateRefreshToken } from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password
    } = req.body;

    const existingUser = await db.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await db.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword
      }
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.status(201).json({
      token: accessToken,
      accessToken,
      refreshToken,
      message: "User created successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};


export const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const user = await db.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials"
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.status(200).json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const profile = async (req, res) => {
  try {
    // 1. Fetch the complete user details from the database using the ID from the token
    const user = await db.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
        // Excluded password for security
      }
    });

    // 2. Handle cases where the user might have been deleted since the token was issued
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 3. Return the full profile details
    res.status(200).json({
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

// REFRESH ACCESS TOKEN
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // 1. Verify Refresh Token JWT signature and validity
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // 2. Hash refresh token and look up in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const tokenRecord = await db.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true }
    });

    if (!tokenRecord) {
      return res.status(401).json({ message: "Refresh token revoked or invalid" });
    }

    // 3. Check expiration
    if (tokenRecord.expiresAt < new Date()) {
      await db.refreshToken.delete({ where: { id: tokenRecord.id } });
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // 4. Token rotation: Generate new Access AND Refresh token
    const newAccessToken = generateAccessToken(tokenRecord.user);
    const newRefreshToken = generateRefreshToken(tokenRecord.user);
    const newHashedRefreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    // Replace the old refresh token with the new one
    await db.refreshToken.delete({ where: { id: tokenRecord.id } });
    await db.refreshToken.create({
      data: {
        userId: tokenRecord.user.id,
        token: newHashedRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // 5. Return both Access Token and rotated Refresh Token
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// LOGOUT (REVOKE REFRESH TOKEN)
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Remove token record from DB
    try {
      await db.refreshToken.delete({
        where: { token: hashedToken }
      });
    } catch (e) {
      // Ignore if record already deleted
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};