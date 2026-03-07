import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import filtersRouter from "./routes/filters";
import uploadRouter from "./routes/upload";
import authRouter from "./routes/auth";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/filters", filtersRouter);
app.use("/api/upload", uploadRouter);

app.use(errorHandler);

export default app;
