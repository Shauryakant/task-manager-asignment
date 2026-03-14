import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return next(new ApiError(400, "Validation failed", errors.array()));
};
