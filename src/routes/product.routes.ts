import { Router } from "express";
import { createProduct } from "../controllers/product.controller";
import { validate } from "../middleware/validate.middleware";
import { createProductSchema } from "../validations/product.validation";

const router = Router();

router.post("/", validate(createProductSchema), createProduct);

export default router;
