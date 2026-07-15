import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getCart, addItem, updateItem, removeItem, clearCart } from "../controllers/cart.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCart);
router.post("/", addItem);
router.patch("/:productId", updateItem);
router.delete("/:productId", removeItem);
router.delete("/", clearCart);

export default router;
