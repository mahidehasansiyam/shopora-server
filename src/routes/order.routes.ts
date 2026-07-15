import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createOrder, getOrders, getOrder } from "../controllers/order.controller";

const router = Router();

router.use(authenticate);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);

export default router;
