import { ApiError } from "../utils/api-error.js";

export const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found"));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    errors: error.errors || [],
  });
};
