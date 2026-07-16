import { Request, Response, NextFunction } from "express";
import Product from "../models/product.model";
import { listProductsQuerySchema } from "../validations/product.validation";

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.issues });
      return;
    }

    const { search, category, sort, page, limit, status } = parsed.data;
    const filter: Record<string, unknown> = {};

    if (!status || status !== "all") {
      filter.status = status || "active";
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, data: { message: "Product deleted successfully" } });
  } catch (err) {
    next(err);
  }
}
