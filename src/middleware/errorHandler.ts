import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log full error server-side for debugging
  // (keeps response to client generic to avoid leaking internals)
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status ?? 500;
  // Don't leak internal error details to clients
  const message = status < 500 ? err.message : "Internal server error";
  res.status(status).json({ error: message });
}
