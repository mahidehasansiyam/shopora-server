import { Request, Response, NextFunction } from "express";
import Product from "../models/product.model";

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(
      {
        success: true,
        data: product
      });
  } catch (err) {
    next(err);
  }
}
