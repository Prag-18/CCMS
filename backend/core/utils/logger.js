function log(level, message, meta) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  const serialized = JSON.stringify(payload);
  if (level === "error" || level === "warn") {
    console.error(serialized);
    return;
  }

  console.log(serialized);
}

module.exports = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
  debug: (message, meta) => log("debug", message, meta),
};
