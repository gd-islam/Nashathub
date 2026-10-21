import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
app.use(express.json());
const PORT = process.env.PORT ?? 5000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is missing from .env");

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
