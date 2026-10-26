import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { UserRequestInterface } from "../interfaces/UserRequestInterface.js";
interface JwtPayLoad {
  id: string;
}

export const requireAuth = async (
  req: UserRequestInterface,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.cookies;

    if (!token)
      return res.status(401).json({ status: 401, message: "session lost" });

    let decoded: JwtPayLoad;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayLoad;
    } catch {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(decoded.id);

    if (!user || user.status !== "approved")
      return res.status(401).json({ status: 401, message: "session lost" });

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something went wrong" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: UserRequestInterface, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });

    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Permission denied" });

    return next();
  };
};
