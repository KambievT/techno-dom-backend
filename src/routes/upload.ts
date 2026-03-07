import { Router } from "express";
import { uploadMiddleware } from "../middleware/multer";
import { uploadImage } from "../controllers/upload";

const router = Router();

router.post("/", uploadMiddleware.single("image"), uploadImage);

export default router;
