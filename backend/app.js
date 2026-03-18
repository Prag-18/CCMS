const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
const { success } = require("./core/utils/response");
const { notFoundMiddleware, errorMiddleware } = require("./core/middleware/error.middleware");

const app = express();

/*
Transport middleware
*/
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
Health check
*/
app.get("/health", (_req, res) => {
  return success(res, {
    message: "CCMS backend is healthy",
    data: { uptime: process.uptime() },
  });
});

/*
API routes
*/
app.use("/api", routes);

/*
Error handling
*/
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
