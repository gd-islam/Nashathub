import { Request, Response } from "express";
import z from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./../models/User.js";
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(["student", "club"]),
});
export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success)
      return res.status(400).json({ message: result.error.issues });

    const { name, email, password, role } = result.data;
    const user = await User.findOne({ email });

    if (user)
      return res
        .status(409)
        .json({ message: "user already exist with this email" });

    const hash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hash,
      role,
    });
    return res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success)
      return res.status(400).json({ message: "invalid data" });

    const { email, password } = result.data;
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(401).json({ message: "email or password invalid" });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "email or password invalid" });

    if (user.status !== "approved")
      return res.status(403).json({
        message:
          "Your account is not approved yet. Please wait for admin approval or contact support.",
        status: user.status,
      });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24,
      })
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "something went wrong" });
  }
};
