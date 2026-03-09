import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await prisma.address.findMany();
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения адресов" });
  }
};

export const getAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const address = await prisma.address.findUnique({
      where: { id: Number(id) },
    });
    if (!address) return res.status(404).json({ error: "Адрес не найден" });
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения адреса" });
  }
};

export const createAddress = async (req: Request, res: Response) => {
  try {
    const { street, city, region, zipCode } = req.body;
    const address = await prisma.address.create({
      data: { street, city, region, zipCode },
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания адреса" });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { street, city, region, zipCode } = req.body;
    const address = await prisma.address.update({
      where: { id: Number(id) },
      data: { street, city, region, zipCode },
    });
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: "Ошибка обновления адреса" });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.address.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления адреса" });
  }
};
