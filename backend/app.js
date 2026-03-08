const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { success } = require("./core/utils/response");
const { notFoundMiddleware, errorMiddleware } = require("./core/middleware/error.middleware");

const app = express();

// App-level middleware is intentionally thin: transport concerns only.
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  return success(res, {
    message: "CCMS backend is healthy",
    data: { uptime: process.uptime() },
  });
});

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
