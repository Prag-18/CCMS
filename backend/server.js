const http = require("http");
const app = require("./app");
const env = require("./core/config/env");
const { testConnection, pool } = require("./core/config/db");
const logger = require("./core/utils/logger");

async function startServer() {
  await testConnection();

  const server = http.createServer(app);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(
        `Port ${env.port} is already in use.\n` +
        `  → Kill the process with:  netstat -ano | findstr :${env.port}\n` +
        `    then:                    taskkill /PID <PID> /F\n` +
        `  → Or just run:            npm run kill-port`
      );
    } else {
      logger.error("Server error", { message: err.message });
    }
    process.exit(1);
  });

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