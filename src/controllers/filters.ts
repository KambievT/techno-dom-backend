import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

const ALLOWED_TYPES = ["checkbox", "select", "range"] as const;
type FilterType = (typeof ALLOWED_TYPES)[number];

// ─── Filter Groups ────────────────────────────────────────────────────────────

export async function getFilterGroups(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const groups = await prisma.filterGroup.findMany({
      include: { options: { orderBy: { label: "asc" } } },
      orderBy: { name: "asc" },
    });
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

export async function createFilterGroup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, key, type } = req.body as {
      name?: string;
      key?: string;
      type?: string;
    };

    if (!name?.trim() || !key?.trim() || !type) {
      res.status(400).json({ error: "name, key, and type are required" });
      return;
    }
    if (!ALLOWED_TYPES.includes(type as FilterType)) {
      res
        .status(400)
        .json({ error: `type must be one of: ${ALLOWED_TYPES.join(", ")}` });
      return;
    }

    const conflict = await prisma.filterGroup.findUnique({
      where: { key: key.trim() },
    });
    if (conflict) {
      res
        .status(409)
        .json({ error: "Filter group with this key already exists" });
      return;
    }

    const group = await prisma.filterGroup.create({
      data: { name: name.trim(), key: key.trim(), type },
      include: { options: true },
    });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
}

export async function updateFilterGroup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid filter group ID" });
      return;
    }

    const existing = await prisma.filterGroup.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Filter group not found" });
      return;
    }

    const { name, key, type } = req.body as {
      name?: string;
      key?: string;
      type?: string;
    };
    const data: { name?: string; key?: string; type?: string } = {};
    if (name !== undefined) data.name = name.trim();
    if (key !== undefined) data.key = key.trim();
    if (type !== undefined) {
      if (!ALLOWED_TYPES.includes(type as FilterType)) {
        res
          .status(400)
          .json({ error: `type must be one of: ${ALLOWED_TYPES.join(", ")}` });
        return;
      }
      data.type = type;
    }

    const group = await prisma.filterGroup.update({
      where: { id },
      data,
      include: { options: true },
    });
    res.json(group);
  } catch (err) {
    next(err);
  }
}

export async function deleteFilterGroup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid filter group ID" });
      return;
    }

    const existing = await prisma.filterGroup.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Filter group not found" });
      return;
    }

    await prisma.filterGroup.delete({ where: { id } }); // options cascade deleted
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ─── Filter Options ───────────────────────────────────────────────────────────

export async function getFilterOptions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const groupId = parseInt(req.params.id as string, 10);
    if (isNaN(groupId)) {
      res.status(400).json({ error: "Invalid filter group ID" });
      return;
    }

    const options = await prisma.filterOption.findMany({
      where: { filterGroupId: groupId },
      orderBy: { label: "asc" },
    });
    res.json(options);
  } catch (err) {
    next(err);
  }
}

export async function createFilterOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const groupId = parseInt(req.params.id as string, 10);
    if (isNaN(groupId)) {
      res.status(400).json({ error: "Invalid filter group ID" });
      return;
    }

    const group = await prisma.filterGroup.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      res.status(404).json({ error: "Filter group not found" });
      return;
    }

    const { label, value } = req.body as { label?: string; value?: string };
    if (!label?.trim() || !value?.trim()) {
      res.status(400).json({ error: "label and value are required" });
      return;
    }

    const option = await prisma.filterOption.create({
      data: {
        label: label.trim(),
        value: value.trim(),
        filterGroupId: groupId,
      },
    });
    res.status(201).json(option);
  } catch (err) {
    next(err);
  }
}

export async function updateFilterOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const optionId = parseInt(req.params.optionId as string, 10);
    if (isNaN(optionId)) {
      res.status(400).json({ error: "Invalid option ID" });
      return;
    }

    const existing = await prisma.filterOption.findUnique({
      where: { id: optionId },
    });
    if (!existing) {
      res.status(404).json({ error: "Filter option not found" });
      return;
    }

    const { label, value } = req.body as { label?: string; value?: string };
    const data: { label?: string; value?: string } = {};
    if (label !== undefined) data.label = label.trim();
    if (value !== undefined) data.value = value.trim();

    const option = await prisma.filterOption.update({
      where: { id: optionId },
      data,
    });
    res.json(option);
  } catch (err) {
    next(err);
  }
}

export async function deleteFilterOption(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const optionId = parseInt(req.params.optionId as string, 10);
    if (isNaN(optionId)) {
      res.status(400).json({ error: "Invalid option ID" });
      return;
    }

    const existing = await prisma.filterOption.findUnique({
      where: { id: optionId },
    });
    if (!existing) {
      res.status(404).json({ error: "Filter option not found" });
      return;
    }

    await prisma.filterOption.delete({ where: { id: optionId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

