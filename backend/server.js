const http = require("http");
const app = require("./app");
const env = require("./core/config/env");
const { testConnection, pool } = require("./core/config/db");
const logger = require("./core/utils/logger");

async function startServer() {
  await testConnection();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    logger.info(`CCMS backend listening on port ${env.port}`);
  });

  const shutdown = async (signal) => {
    logger.warn(`Received ${signal}. Closing server gracefully.`);

    server.close(async () => {
      await pool.end();
      logger.info("HTTP server and DB pool closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  logger.error("Failed to start backend", {
    message: error.message,
    stack: error.stack
  });

  process.exit(1);
});