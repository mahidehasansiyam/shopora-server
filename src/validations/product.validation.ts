import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  discountPrice: z.number().min(0, "Discount price must be non-negative").optional(),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(["active", "draft", "archived", "out of stock"]),
  images: z.array(z.string()).optional(),
});
