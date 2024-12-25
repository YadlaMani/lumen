import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
interface CustomRequest extends Request {
  userId?: string;
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}
export const userMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  if (header) {
    try {
      const decoded = jwt.verify(
        header as string,
        process.env.JWT_SECRET as string
      ) as {
        id: string;
      };
      if (decoded) {
        req.userId = decoded.id;
      }
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }
  next();
};
