import bcrypt from "bcrypt";
import db from "../config/db.js";
import generateToken from "../utils/generateToken.js";

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

    const token = generateToken(user);

    res.status(201).json({
      token,
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email
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

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user.id,
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