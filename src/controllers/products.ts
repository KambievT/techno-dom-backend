import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import {
  minioClient,
  BUCKET_NAME,
  getImageUrl,
  ensureBucket,
} from "../config/minio";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { ProductQuery } from "../types";

const ALLOWED_SORT_FIELDS = ["price", "name", "rating", "createdAt"] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = req.query as ProductQuery;

    const page = Math.max(1, parseInt(q.page ?? "1", 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(q.pageSize ?? "12", 10) || 12),
    );
    const skip = (page - 1) * pageSize;

    const sortField: SortField = ALLOWED_SORT_FIELDS.includes(
      q.sortBy as SortField,
    )
      ? (q.sortBy as SortField)
      : "createdAt";
    const sortOrder: Prisma.SortOrder = q.sortOrder === "asc" ? "asc" : "desc";

    const where: Prisma.ProductWhereInput = {
      ...(q.category && { category: q.category }),
      ...(q.search && { name: { contains: q.search } }),
      ...(q.inStock !== undefined && { inStock: q.inStock === "true" }),
      ...((q.minPrice !== undefined || q.maxPrice !== undefined) && {
        price: {
          ...(q.minPrice !== undefined && { gte: parseFloat(q.minPrice) }),
          ...(q.maxPrice !== undefined && { lte: parseFloat(q.maxPrice) }),
        },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortOrder },
        include: { address: true },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function uploadImageToMinio(file: Express.Multer.File): Promise<string> {
  await ensureBucket();
  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const filename = `${uuidv4()}${ext}`;
  await minioClient.putObject(BUCKET_NAME, filename, file.buffer, file.size, {
    "Content-Type": file.mimetype,
  });
  return getImageUrl(filename);
}

function parseBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      name,
      description,
      price,
      oldPrice,
      category,
      inStock,
      rating,
      reviewCount,
      addressId,
    } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      !category?.trim()
    ) {
      res
        .status(400)
        .json({ error: "name, description, price, and category are required" });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      res.status(400).json({ error: "price must be a non-negative number" });
      return;
    }

    // Support multiple uploaded files (req.files) or single (req.file)
    const files =
      (req.files as Express.Multer.File[]) ??
      (req.file ? [req.file as Express.Multer.File] : []);

    const uploaded: { url: string; filename?: string }[] = [];
    if (files && files.length > 0) {
      for (const f of files) {
        try {
          // eslint-disable-next-line no-console
          console.log(`Uploading file ${f.originalname} (${f.size} bytes)`);
          const url = await uploadImageToMinio(f);
          uploaded.push({ url, filename: f.originalname });
        } catch (e) {
          // Log and rethrow so errorHandler can capture stack
          // eslint-disable-next-line no-console
          console.error(`Failed to upload ${f.originalname}:`, e);
          throw e;
        }
      }
    }

    const imageUrl = uploaded.length > 0 ? uploaded[0].url : null;

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        description: String(description).trim(),
        price: priceNum,
        oldPrice:
          oldPrice !== undefined && oldPrice !== ""
            ? parseFloat(oldPrice)
            : null,
        imageUrl,
        category: String(category).trim(),
        inStock: parseBool(inStock, true),
        rating: rating !== undefined ? parseFloat(rating) : 0,
        reviewCount: reviewCount !== undefined ? parseInt(reviewCount, 10) : 0,
        addressId:
          addressId !== undefined && addressId !== ""
            ? Number(addressId)
            : null,
        images: uploaded.length
          ? {
              create: uploaded.map((u) => ({
                url: u.url,
                filename: u.filename,
              })),
            }
          : undefined,
      },
      include: { address: true, images: true },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    console.log("Request body:", req.body);

    const {
      name,
      description,
      price,
      oldPrice,
      category,
      inStock,
      rating,
      reviewCount,
      addressId,
    } = req.body;

    const data: Prisma.ProductUpdateInput = {};
    if (name !== undefined) data.name = String(name).trim();
    if (description !== undefined)
      data.description = String(description).trim();
    if (price !== undefined) data.price = parseFloat(price);
    if (oldPrice !== undefined)
      data.oldPrice = oldPrice === "" ? null : parseFloat(oldPrice);
    if (category !== undefined) data.category = String(category).trim();
    if (inStock !== undefined)
      data.inStock = parseBool(inStock, existing.inStock);
    if (rating !== undefined) data.rating = parseFloat(rating);
    if (reviewCount !== undefined) data.reviewCount = parseInt(reviewCount, 10);
    // Handle multiple uploaded files when updating
    const newFiles =
      (req.files as Express.Multer.File[]) ??
      (req.file ? [req.file as Express.Multer.File] : []);
    if (newFiles && newFiles.length > 0) {
      const uploaded: { url: string; filename?: string }[] = [];
      for (const f of newFiles) {
        try {
          // eslint-disable-next-line no-console
          console.log(
            `Uploading (update) file ${f.originalname} (${f.size} bytes)`,
          );
          const url = await uploadImageToMinio(f);
          uploaded.push({ url, filename: f.originalname });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`Failed to upload (update) ${f.originalname}:`, e);
          throw e;
        }
      }
      // set main image to first uploaded
      data.imageUrl = uploaded[0].url;
      // attach additional images
      data.images = {
        create: uploaded.map((u) => ({ url: u.url, filename: u.filename })),
      } as any;
    }
    if (addressId !== undefined)
      data.address =
        addressId === ""
          ? { disconnect: true }
          : { connect: { id: Number(addressId) } };

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { address: true, images: true },
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
