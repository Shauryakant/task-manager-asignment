import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  getAccessCookieOptions,
  getRefreshCookieOptions,
} from "../utils/cookie-options.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const issueTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = await issueTokens(user);

  return res
    .status(201)
    .cookie("accessToken", accessToken, getAccessCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshCookieOptions())
    .json(
      new ApiResponse(
        201,
        { user: sanitizeUser(user) },
        "User registered successfully",
      ),
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshCookieOptions())
    .json(
      new ApiResponse(200, { user: sanitizeUser(user) }, "Login successful"),
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  return res
    .status(200)
    .clearCookie("accessToken", getAccessCookieOptions())
    .clearCookie("refreshToken", getRefreshCookieOptions())
    .json(new ApiResponse(200, null, "Logout successful"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: sanitizeUser(req.user) },
        "Current user fetched successfully",
      ),
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token does not match");
  }

  const accessToken = user.generateAccessToken();

  return res
    .status(200)
    .cookie("accessToken", accessToken, getAccessCookieOptions())
    .json(new ApiResponse(200, null, "Access token refreshed"));
});
