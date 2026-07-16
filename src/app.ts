import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import errorHandler from "./middleware/error.middleware";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to MongoDB" });
});

app.use("/api", routes);
app.use(errorHandler);

export default app;



