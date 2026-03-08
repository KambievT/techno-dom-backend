import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "crypto";

export function login(req: Request, res: Response) {
  const { password } = req.body as { password?: string };

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;

  if (!adminPassword || !secret) {
    res.status(500).json({ error: "Auth not configured" });
    return;
  }

  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "24h" });
  res.json({ token });
}
