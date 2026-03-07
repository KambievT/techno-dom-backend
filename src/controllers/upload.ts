import { Request, Response, NextFunction } from "express";
import {
  minioClient,
  BUCKET_NAME,
  getImageUrl,
  ensureBucket,
} from "../config/minio";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      res
        .status(400)
        .json({
          error:
            'No file uploaded. Use multipart/form-data with field "image".',
        });
      return;
    }

    await ensureBucket();
    const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
    const filename = `${uuidv4()}${ext}`;

    await minioClient.putObject(
      BUCKET_NAME,
      filename,
      req.file.buffer,
      req.file.size,
      {
        "Content-Type": req.file.mimetype,
      },
    );

    res.status(201).json({ url: getImageUrl(filename), filename });
  } catch (err) {
    next(err);
  }
}
