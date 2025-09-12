import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

// Middleware to verify JWT and protect routes
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // Assuming token is sent in Authorization header as Bearer token Or it can be sent as a cookie
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
    
        if (!token) {
            throw new ApiError(401, "No token provided, please login first or Unauthorized request");
        }
    
        // Verify the token using the secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
    
        // Find the user by ID from the token
        const user = await User.findById(decodedToken._id).select("-password -refreshToken"); 

        if(!user)
        {
            throw new ApiError(401, "Invalid Access Token");
        }
        
        req.user = user; // Attach user to request object for further use
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});