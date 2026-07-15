import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export default function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error:", err);

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ success: false, message: "Validation error", errors: messages });
    return;
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
    return;
  }

  if (err.name === "CastError") {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }

  res.status(500).json({ success: false, message: err.message || "Internal server error" });
}
