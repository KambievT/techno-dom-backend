import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
  const { password } = req.body as { password?: string };

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.JWT_SECRET;

  if (!hash || !secret) {
    res.status(500).json({ error: "Auth not configured" });
    return;
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "24h" });
  res.json({ token });
}
