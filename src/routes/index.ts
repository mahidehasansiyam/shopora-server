import { Router } from "express";
import productRoutes from "./product.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import usersRoutes from "./users.routes";

const router = Router();

router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", usersRoutes);

export default router;
