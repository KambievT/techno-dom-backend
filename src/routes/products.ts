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
router.post("/", uploadMiddleware.single("image"), createProduct);
router.put("/:id", uploadMiddleware.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
