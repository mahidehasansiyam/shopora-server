import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model";
import Product from "../models/product.model";

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

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();

    const currentUser = await db.collection("user").findOne({ _id: asObjectId(req.userId) } as any);
    if (!currentUser || currentUser.role !== "admin") {
      res.status(403).json({ success: false, message: "Admin access required" });
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      currentRevenueResult,
      prevRevenueResult,
      currentOrdersCount,
      prevOrdersCount,
      totalProducts,
      totalUsersResult,
      prevUsersResult,
      revenueOverTime,
      ordersOverTime,
      ordersByStatus,
      topProducts,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Product.countDocuments(),
      db.collection("user").countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      db.collection("user").countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: "paid" } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        }},
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        }},
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 }).limit(5).lean(),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: currentRevenueResult[0]?.total || 0,
          revenuePrevPeriod: prevRevenueResult[0]?.total || 0,
          totalOrders: currentOrdersCount,
          ordersPrevPeriod: prevOrdersCount,
          totalProducts,
          totalUsers: totalUsersResult,
          usersPrevPeriod: prevUsersResult,
        },
        revenueOverTime: revenueOverTime.map((r) => ({ date: r._id, revenue: r.revenue })),
        ordersOverTime: ordersOverTime.map((r) => ({ date: r._id, count: r.count })),
        ordersByStatus: ordersByStatus.map((r) => ({ status: r._id, count: r.count })),
        topProducts,
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (err) {
    next(err);
  }
}
