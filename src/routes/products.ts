import { Router } from "express";
import { uploadMiddleware } from "../middleware/multer";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", uploadMiddleware.array("images"), createProduct);
router.put("/:id", uploadMiddleware.array("images"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
