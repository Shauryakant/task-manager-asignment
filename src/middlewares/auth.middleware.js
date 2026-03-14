import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  req.user = user;
  next();
});
