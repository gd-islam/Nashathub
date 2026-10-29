import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT ?? 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

async function start() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is missing from .env");
    if (!process.env.JWT_SECRET)
      throw new Error("JWT_SECRET is missing from .env");

    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected successfuly");

    app.listen(PORT, () =>
      console.log(`Api running on http://localhost:${PORT}`),
    );
  } catch (error) {
    console.log("Failed to start  the server:", error);
    process.exit(1);
  }
}
start();
