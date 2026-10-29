import { Request, Response } from "express";
import z from "zod";
import User from "../models/User.js";
import mongoose from "mongoose";
import { UserRequestInterface } from "../interfaces/UserRequestInterface.js";

export const getUserSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});
export const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = getUserSchema.safeParse(req.query);
    if (!result.success)
      return res.status(400).json({ status: 400, message: "data not right" });
    const { status } = result.data;
    const users = await User.find({ status })
      .select("-password")
      .sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, users });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "something went wrong" });
  }
};

export const updateStatus = async (
  req: UserRequestInterface,
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ status: 400, message: "id is not valid" });

    const result = updateStatusSchema.safeParse(req.body);
    if (!result.success)
      return res.status(400).json({ status: 400, message: "data not right" });

    const { status } = result.data;

    if (req.user!.id === id)
      return res
        .status(403)
        .json({ status: 403, message: "you can't change ur own status" });

    const user = await User.findOneAndUpdate(
      { _id: id, role: { $in: ["student", "club"] } },
      { status },
      { returnDocument: "after" },
    );
    if (!user)
      return res
        .status(404)
        .json({ message: "No student or club account found with this id" });

    return res.status(200).json({
      status: 200,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "something went wrong" });
  }
};
