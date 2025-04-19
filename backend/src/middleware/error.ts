export function handleError(error, req, res, next) {
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  res
    .status(500)
    .json({ error: "Internal server error", details: error.message });
}
