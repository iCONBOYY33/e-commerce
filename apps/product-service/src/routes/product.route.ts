import { Router } from "express";
import { shouldBeAdmin } from "../middleware/auth";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router: Router = Router();

router.post("/", shouldBeAdmin, createProduct);
router.get("/:id", getProductById);
router.get("/", getAllProducts);
router.put("/:id", shouldBeAdmin, updateProduct);
router.delete("/:id", shouldBeAdmin, deleteProduct);

export default router;
