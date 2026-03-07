import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, slug } = req.body as { name?: string; slug?: string };

    if (!name?.trim() || !slug?.trim()) {
      res.status(400).json({ error: "name and slug are required" });
      return;
    }

    const nameClean = name.trim();
    const slugClean = slug.trim();

    const conflict = await prisma.category.findFirst({
      where: { OR: [{ name: nameClean }, { slug: slugClean }] },
    });
    if (conflict) {
      res
        .status(409)
        .json({ error: "Category with this name or slug already exists" });
      return;
    }

    const category = await prisma.category.create({
      data: { name: nameClean, slug: slugClean },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const { name, slug } = req.body as { name?: string; slug?: string };
    const data: { name?: string; slug?: string } = {};
    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) data.slug = slug.trim();

    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

