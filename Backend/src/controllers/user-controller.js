import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// generating the access token and refresh token method for login
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // save refreshToken in DB for later validation
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password, mobile, city, state, pincode, AddressLine1, AddressLine2 } = req.body;

    // Validation
    if ([fullName, username, email, password, mobile, city, state, pincode, AddressLine1, AddressLine2].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }, { mobile }]
    });

    if (existingUser) {
        throw new ApiError(400, "User already exists with this username, email or phone");
    }

    // Avatar upload
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Error in uploading avatar");
    }

    // Create user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        username: username.toLowerCase(),
        email,
        password,
        mobile,
        city,
        state,
        pincode,
        AddressLine1,
        AddressLine2
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development", // true in production, false in local
        sameSite: "strict"
    };

    // Send response
    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions) // ✅ added refresh token in cookie too
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken, // also returning in body for frontend apps (like React)
                    refreshToken
                },
                "User registered successfully"
            )
        );
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // ✅ Validation
    if ((!email && !username) || !password) {
        throw new ApiError(400, "Email/Username and password are required to login");
    }

    // ✅ Find user
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(404, "User not found with this username or email");
    }

    // ✅ Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // ✅ Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // ✅ Hide sensitive data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // ✅ Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development", // only secure in prod
        sameSite: "strict"
    };

    // ✅ Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options) // include refreshToken cookie also
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,  // send in body for frontend apps (like React)
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});


// Logout User Controller
// Logout User Controller
const logoutUser = asyncHandler(async (req, res) => {
  // If authenticated, remove refresh token from DB
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict"
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
    // 1. Get old and new Password from fronted side
    // 2. get the user by req.user.id
    // 3. check if old password is correct
    // 4. hash the new password
    // 5. update new password in user doucment
    // 6. save the user
    // 7. send response

    // 1. Get old and new Password from fronted side
    const { oldPassword, newPassword } = req.body;

    // 2. get the user by req.user.id
    const user = await User.findById(req.user?._id);

    // 3. check if old password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    // 4. hash the new password
    user.password = newPassword;

    // 5. update new password in user doucment
    await user.save({ validateBeforeSave: false }); //6. save user and validation false for not to check other fields

    // 7. send response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Method for generaing access token from refresh token after expiry of access token each time
// Method for generating a new access token using a valid refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Step 1: Get refresh token either from cookie or from request body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        // If refresh token is not provided, user is not authorized
        throw new ApiError(401, "No refresh token provided, please login first or Unauthorized request");
    }

    // Step 2: Verify the refresh token with the secret key
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("decodedToken: ", decodedToken); // debug log (remove in production)
    } catch (error) {
        // If token verification fails, it’s invalid/expired
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Step 3: Find the user from the decoded token
    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token or user does not exist");
    }

    // Step 4: Compare incoming refresh token with stored one in DB
    // This ensures refresh token is not tampered or already rotated
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or has already been used");
    }

    try {
        // Step 5: Define cookie options
        const options = {
            httpOnly: true, // prevent XSS attacks by restricting client-side JS
            secure: true,   // only allow cookies over HTTPS (set false for local dev if needed)
        };

        // Step 6: Generate new access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Step 7: Send new tokens in cookies and response body
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken }, // return tokens for mobile/other clients too
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        // Step 8: Handle unexpected errors
        throw new ApiError(401, error?.message || "Could not refresh access token");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is already populated by verifyJWT
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized");
  return res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, AddressLine1, AddressLine2, state, pincode, city } = req.body;

  // Basic validation (AddressLine2 can be optional)
  if ([fullName, email, city, state, pincode, AddressLine1].some((field) => !field || field.toString().trim() === "")) {
    throw new ApiError(400, "All required fields are required");
  }

  // Update using req.user._id
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
        AddressLine1,
        AddressLine2,
        state,
        pincode,
        city,
      }
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    // 1. get the file from client/fronted
    const avatarLocalPath = req.file?.path;

    // 2. check if file is provided
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // 3. upload the file to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // 4. check if avatar is uploaded ?
    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading avatar on cloudinary");
    }

    // 5. update the user documnet
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    // 6. send response
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User avatar updated successfully"));
})

export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
};