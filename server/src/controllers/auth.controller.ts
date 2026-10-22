import { Request, Response } from "express";
import z from "zod";
import bcrypt from "bcrypt";
import User from "./../models/User.js";
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(["student", "club"]),
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
    return res
      .status(201)
      .json({
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
