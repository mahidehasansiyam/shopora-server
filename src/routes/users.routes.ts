import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getUsers, deleteUser } from "../controllers/users.controller";

const router = Router();

router.get("/", authenticate, getUsers);
router.delete("/:id", authenticate, deleteUser);

export default router;
