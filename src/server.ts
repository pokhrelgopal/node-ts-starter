import app from "./app";
import { port } from "./config";
import prisma from "./db/prisma";

function startServer() {
  try {
    app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("🌋 Error starting server:", error);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    try {
      await prisma.$disconnect();
      console.log("Prisma client disconnected successfully.");
    } catch (error) {
      console.error("Error disconnecting Prisma client:", error);
    } finally {
      process.exit(0);
    }
  });
}

startServer();
