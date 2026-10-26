import { Request } from "express";

export interface UserRequestInterface extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}
