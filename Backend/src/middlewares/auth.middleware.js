// middlewares/auth.middleware.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import { Recycler } from "../models/recycler.model.js";

// Middleware to verify JWT and protect routes
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Accept token from cookie OR Authorization header "Bearer <token>"
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader && typeof authHeader === 'string') {
        // remove "Bearer " prefix (case sensitive) and trim
        token = authHeader.replace(/^Bearer\s+/i, '').trim();
      }
    }

    if (!token) {
      throw new ApiError(401, "No token provided, please login first or Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifyJWTRecycler = asyncHandler(async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader && typeof authHeader === 'string') {
        token = authHeader.replace(/^Bearer\s+/i, '').trim();
      }
    }

    if (!token) {
      throw new ApiError(401, "No token provided, please login first or Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const recycler = await Recycler.findById(decodedToken._id).select("-password -refreshToken");
    if (!recycler) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.recycler = recycler;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});