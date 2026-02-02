import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getAllCategories,
} from "../controllers/category.controller";
import { shouldBeAdmin, shouldBeUser } from "../middleware/auth";

const router: Router = Router();

router.post("/", shouldBeAdmin, createCategory);
router.put("/:id", shouldBeAdmin, updateCategory);
router.delete("/:id", shouldBeAdmin, deleteCategory);
router.get("/", getAllCategories);

export default router;
