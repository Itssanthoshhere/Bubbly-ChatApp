import type { Request, Response } from "express";
import User from "../models/User.ts";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.ts";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, name, avatar } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      res
        .status(400)
        .json({ success: false, msg: "User with this email already exists" });
      return;
    }

    // Create new user
    user = new User({ email, password, name, avatar: avatar || "" });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // generate JWT token
    const token = generateToken(user);

    res.json({ success: true, token });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      res
        .status(400)
        .json({ success: false, msg: "Invalid email or password" });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res
        .status(400)
        .json({ success: false, msg: "Invalid email or password" });
      return;
    }

    // generate JWT token
    const token = generateToken(user);

    res.json({ success: true, token });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
