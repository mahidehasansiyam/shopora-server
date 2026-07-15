import { Request, Response, NextFunction } from "express";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import { addToCartSchema, updateCartItemSchema } from "../validations/cart.validation";

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    res.json({ success: true, data: cart || { userId: req.userId, items: [] } });
  } catch (err) {
    next(err);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.issues });
      return;
    }

    const { productId, quantity } = parsed.data;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: `Insufficient stock. Only ${product.stock} available.` });
      return;
    }

    const price = product.discountPrice ?? product.price;
    const image = product.images?.[0] || "";

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({
        userId: req.userId,
        items: [{ productId: product._id, name: product.name, price, image, quantity }],
      });
    } else {
      const existingIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({ productId: product._id, name: product.name, price, image, quantity });
      }
    }

    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;

    const parsed = updateCartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.issues });
      return;
    }

    const { quantity } = parsed.data;

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      res.status(404).json({ success: false, message: "Cart not found" });
      return;
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingIndex === -1) {
      res.status(404).json({ success: false, message: "Item not found in cart" });
      return;
    }

    if (quantity === 0) {
      cart.items.splice(existingIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (product && product.stock < quantity) {
        res.status(400).json({ success: false, message: `Insufficient stock. Only ${product.stock} available.` });
        return;
      }
      cart.items[existingIndex].quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      res.status(404).json({ success: false, message: "Cart not found" });
      return;
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    await Cart.findOneAndDelete({ userId: req.userId });
    res.json({ success: true, data: { userId: req.userId, items: [] } });
  } catch (err) {
    next(err);
  }
}
