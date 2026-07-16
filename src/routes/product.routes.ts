import { Router } from "express";
import { createProduct, getProducts, getProductById } from "../controllers/product.controller";
import { validate } from "../middleware/validate.middleware";
import { createProductSchema } from "../validations/product.validation";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", validate(createProductSchema), createProduct);

export default router;
