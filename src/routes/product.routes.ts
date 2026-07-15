import { Router } from "express";
import { createProduct, getProducts } from "../controllers/product.controller";
import { validate } from "../middleware/validate.middleware";
import { createProductSchema } from "../validations/product.validation";

const router = Router();

router.get("/", getProducts);
router.post("/", validate(createProductSchema), createProduct);

export default router;
