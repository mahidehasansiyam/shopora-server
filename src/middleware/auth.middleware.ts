import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({ success: false, message: "Database not connected" });
      return;
    }

    const session = await db.collection("session").findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      res.status(401).json({ success: false, message: "Invalid or expired session" });
      return;
    }

    req.userId = session.userId as string;
    next();
  } catch (err) {
    next(err);
  }
}
