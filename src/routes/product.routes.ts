import { Router } from "express";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/product.controller";
import { validate } from "../middleware/validate.middleware";
import { createProductSchema, updateProductSchema } from "../validations/product.validation";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", validate(createProductSchema), createProduct);
router.patch("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
