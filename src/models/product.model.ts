import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  status: "active" | "draft" | "archived" | "out of stock";
  images: string[];
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "draft", "archived", "out of stock"],
      default: "draft",
    },
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
