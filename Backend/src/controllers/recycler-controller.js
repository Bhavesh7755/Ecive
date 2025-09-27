import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Recycler } from "../models/recycler.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Generate tokens for recycler
const generateAccessAndRefreshToken = async (recyclerId) => {
    try {
        const recycler = await Recycler.findById(recyclerId);
        const accessToken = recycler.generateAccessToken();
        const refreshToken = recycler.generateRefreshToken();

        // ✅ Save refreshToken in DB
        recycler.refreshToken = refreshToken;
        await recycler.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerRecycler = asyncHandler(async (req, res) => {
    const {
        username,
        fullName,
        email,
        mobile,
        password,
        AddressLine1,
        AddressLine2,
        city,
        state,
        pincode,
        shopName
    } = req.body;

    // ✅ Check if all fields are present
    if (!username || !fullName || !email || !mobile || !password || !AddressLine1 || !AddressLine2 || !city || !state || !pincode || !shopName) {
        throw new ApiError(400, "All fields are required");
    }

    // ✅ Check if recycler already exists
    const existingRecycler = await Recycler.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }, { mobile }]
    });
    if (existingRecycler) {
        throw new ApiError(409, "Recycler with this username, email, or mobile already exists");
    }

    // ✅ Upload avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) throw new ApiError(500, "Avatar upload failed");

    // ✅ Upload shop image
    const shopImageLocalPath = req.files?.shopImage?.[0]?.path;
    if (!shopImageLocalPath) throw new ApiError(400, "Shop Image is required");
    const shopImage = await uploadOnCloudinary(shopImageLocalPath);
    if (!shopImage?.url) throw new ApiError(500, "Shop image upload failed");

    // ✅ Upload identity proof
    const identityProofLocalPath = req.files?.identity?.[0]?.path;
    if (!identityProofLocalPath) throw new ApiError(400, "Identity Proof is required");
    const identityProof = await uploadOnCloudinary(identityProofLocalPath);
    if (!identityProof?.url) throw new ApiError(500, "Identity proof upload failed");

    // ✅ Create recycler
    const recycler = await Recycler.create({
        username: username.toLowerCase(),
        fullName,
        avatar: avatar.url,
        email: email.toLowerCase(),
        mobile,
        password,
        AddressLine1,
        AddressLine2,
        city,
        state,
        pincode,
        shopName,
        shopImage: shopImage.url,
        identity: identityProof.url,
        isVerified: false,
        rating: 0
    });

    if (!recycler) {
        throw new ApiError(500, "Unable to create recycler account, please try again");
    }

    // ✅ Generate tokens and save refresh token in DB
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(recycler._id);

    // ✅ Remove sensitive fields
    const createdRecycler = await Recycler.findById(recycler._id).select("-password -refreshToken");

    // ✅ Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development", // only secure in prod
        sameSite: "strict"
    };

    // ✅ Return response with tokens
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options) // store refreshToken in cookie
        .json(
            new ApiResponse(
                201,
                {
                    recycler: createdRecycler,
                    accessToken,  // send in body (for React frontend use)
                    refreshToken
                },
                "Recycler registered successfully"
            )
        );
});



const loginRecycler = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // ✅ Validation
    if ((!email && !username) || !password) {
        throw new ApiError(400, "Email/Username and password are required to login");
    }

    // ✅ Find recycler by email or username
    const recycler = await Recycler.findOne({
        $or: [
            { email: email?.toLowerCase() },
            { username: username?.toLowerCase() }
        ]
    });

    if (!recycler) {
        throw new ApiError(404, "No recycler found with this email or username");
    }

    // ✅ Verify password
    const isPasswordValid = await recycler.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // ✅ Generate new tokens (refreshToken saved in DB inside this function)
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(recycler._id);

    // ✅ Exclude sensitive fields
    const loggedInRecycler = await Recycler.findById(recycler._id).select("-password -refreshToken");

    // ✅ Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development", // only true in prod
        sameSite: "strict"
    };

    // ✅ Send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    recycler: loggedInRecycler,
                    accessToken,  // for frontend (React) use
                    refreshToken
                },
                "Recycler logged in successfully"
            )
        );
});

const logoutRecycler = asyncHandler(async (req, res) => {
    // Make sure recycler is authenticated
    if (!req.recycler?._id) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Remove the refresh token from DB for this recycler
    await Recycler.findByIdAndUpdate(
        req.recycler._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    };

    // Clear both cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Recycler logged out successfully"));
});


// Method for generaing access token from refresh token after expiry of access token each time
const refreshAccessToken = asyncHandler(async (req, res) => {
    // 1️⃣ Get the refresh token from cookie or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "No refresh token provided. Please login first.");
    }

    // 2️⃣ Verify the refresh token
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("decodedToken:", decodedToken);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // 3️⃣ Find recycler by ID stored in token
    const recycler = await Recycler.findById(decodedToken?._id);

    if (!recycler) {
        throw new ApiError(401, "Invalid refresh token or recycler does not exist");
    }

    // 4️⃣ Check if refresh token matches the one stored in DB
    if (incomingRefreshToken !== recycler.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or already used");
    }

    // 5️⃣ Generate new access and refresh tokens
    try {
        const options = {
            httpOnly: true,
            secure: true, // set to true if using https
            sameSite: "strict"
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(recycler._id);

        // 6️⃣ Send new tokens in cookies and response
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to refresh access token");
    }
});


export {
    registerRecycler,
    loginRecycler,
    logoutRecycler,
    refreshAccessToken,
};