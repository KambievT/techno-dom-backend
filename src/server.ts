import "dotenv/config";
import app from "./app";
import { prisma } from "./config/database";

const PORT = parseInt(process.env.PORT || "4000", 10);

async function main() {
  await prisma.$connect();
  console.log("Database connected");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
