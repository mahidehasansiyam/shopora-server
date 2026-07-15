import dotenv from "dotenv";

if (!process.env.VERCEL) {
  dotenv.config();
}

export const env = {
  port: Number(process.env.PORT) || 9000,
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "fallback_secret",
};
