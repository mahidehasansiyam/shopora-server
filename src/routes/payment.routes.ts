import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createCheckoutSession, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/create-checkout-session", authenticate, createCheckoutSession);
router.post("/verify", authenticate, verifyPayment);

export default router;
