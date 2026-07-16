import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

function getDb() {
  return mongoose.connection.getClient().db("shopora");
}

function asObjectId(value: unknown): mongoose.Types.ObjectId | string {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === "string") {
    try {
      return new mongoose.Types.ObjectId(value);
    } catch {
      return value;
    }
  }
  return String(value);
}

function idFilter(value: unknown) {
  return { _id: asObjectId(value) } as any;
}

function userIdFilter(value: unknown) {
  return { userId: asObjectId(value) } as any;
}

function idsEqual(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();

    const currentUser = await db.collection("user").findOne(idFilter(req.userId));
    if (!currentUser || currentUser.role !== "admin") {
      res.status(403).json({ success: false, message: "Admin access required" });
      return;
    }

    const users = await db.collection("user")
      .find(
        {},
        {
          projection: { hashedPassword: 0 },
          sort: { createdAt: -1 },
        } as any,
      )
      .toArray();

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();

    const currentUser = await db.collection("user").findOne(idFilter(req.userId));
    if (!currentUser || currentUser.role !== "admin") {
      res.status(403).json({ success: false, message: "Admin access required" });
      return;
    }

    const targetId = req.params.id as string;

    if (idsEqual(targetId, req.userId)) {
      res.status(400).json({ success: false, message: "Cannot delete your own account" });
      return;
    }

    const target = await db.collection("user").findOne(idFilter(targetId));
    if (!target) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    await db.collection("user").deleteOne(idFilter(targetId));
    await db.collection("session").deleteMany(userIdFilter(targetId));

    res.json({ success: true, data: { message: "User deleted successfully" } });
  } catch (err) {
    next(err);
  }
}
