import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      default: "student",
      enum: ["student", "club", "admin"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["approved", "pending", "rejected"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
