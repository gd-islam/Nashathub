import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import z from "zod";
import User from "../models/User.js";

const adminZod = z.object({
  name: z.string().min(2),
  email: z.email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(["admin"]),
});

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("env variables is missing");

    const result = adminZod.safeParse({
      name: process.env?.ADMIN_NAME,
      email: process.env?.ADMIN_EMAIL,
      password: process.env?.ADMIN_PASSWORD,
      role: "admin",
    });

    if (!result.success) {
      console.error("invalides or missing environment variables");
     return  process.exitCode = 1;
    }
    await mongoose.connect(process.env.MONGO_URI!);

    const { name, email, password, role } = result.data;

    const user = await User.findOne({ email });
    if (user) return console.log("Admin already exist");
    const hash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hash,
      role: role,
      status: "approved",
    });

    console.log("Admin: ", email);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
