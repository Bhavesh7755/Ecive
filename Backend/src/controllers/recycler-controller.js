import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Recycler } from "../models/recycler.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (recyclerId) => {
    try {
        const recycler = await Recycler.findById(recyclerId);
        const accessToken = recycler.generateAccessToken();
        const refreshToken = recycler.generateRefreshToken();
        recycler.refreshToken = refreshToken;
        await recycler.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

const registerRecycler = asyncHandler(async (req, res) => {
    const { username, fullName, email, mobile, password, AddressLine1, AddressLine2, city, state, pincode, shopName } = req.body;

    if ([username, fullName, email, mobile, password, AddressLine1, AddressLine2, city, state, pincode, shopName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const exitedRecycler = await Recycler.findOne({
        $or: [{ username }, { email }, { mobile }]
    });

    if (exitedRecycler) {
        throw new ApiError(409, "Recycler with this username or email or mobile already exists");
    };

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const shopImageLocalPath = req.files?.shopImage?.[0]?.path;

    if (!shopImageLocalPath) {
        throw new ApiError(400, "Shop Image is required");
    }

    const shopImage = await uploadOnCloudinary(shopImageLocalPath);

    const identityProofLocalPath = req.files?.identity?.[0]?.path;

    if (!identityProofLocalPath) {
        throw new ApiError(400, "Identity Proof is required");
    }

    const identityProof = await uploadOnCloudinary(identityProofLocalPath);

    const recycler = await Recycler.create({
        username: username?.toLowerCase(),
        fullName,
        avatar: avatar?.url,
        email,
        mobile,
        password,
        AddressLine1,
        AddressLine2,
        city,
        state,
        pincode,
        shopName,
        shopImage: shopImage?.url,
        identity: identityProof?.url,
        isVerified: false, // default false
        rating: 0, // default 0
    });

    const createdRecycler = await Recycler.findById(recycler._id).select("-password -refreshToken");

    if (!createdRecycler) {
        throw new ApiError(500, "Unable to create recycler account, please try again");
    };

    return res.status(201).json(
        new ApiResponse(201, createdRecycler, "Recycler registered successfully")
    );
});

const loginRecycler = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
        throw new ApiError(400, "Email or Username ans password are required to login");
    }

    const recycler = await Recycler.findOne({
        $or: [
            { email },
            { username: username?.toLowerCase() }
        ]
    });

    if (!recycler) {
        throw new ApiError(404, "No recycler found with this email or username");
    };

    const isPasswordValid = await recycler.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(recycler._id);

    const loggedInRecycler = await Recycler.findById(recycler._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    recycler: loggedInRecycler,
                    accessToken,
                    refreshToken
                },
                "Recycler logged in successfully"
            )
        );
})

const logoutRecycler = asyncHandler(async (req, res) => {
    await Recycler.findByIdAndUpdate(
        req.recycler._id,
        {
            $set: {
                refreshToken: undefined // remove the refresh token from the user document
            }
        },
        {
            new: true  // return the updated user document
        }
    )

    const options = {
        httpOnly: true,
        secure: true, // set to true if using https
    }

    return res
        .status(200)
        .clearCookie("accessToken", "", options) // clear the access token cookie
        .clearCookie("refreshToken", "", options) // clear the refresh token cookie
        .json(new ApiResponse(200, {}, "Recycler logged out successfully"));
})

// Method for generaing access token from refresh token after expiry of access token each time
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // get the refresh token from the cookie or request body from user side

    if (!incomingRefreshToken) {
        throw new ApiError(401, "No refresh token provided, please login first or Unauthorized request");
    }

    // verify the refresh token
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("decodedToken: ", decodedToken);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token: ");
    }

    const recycler = await Recycler.findById(decodedToken?._id)

    if (!recycler) {
        throw new ApiError(401, "Invalid refresh token or user does not exist");
    }


    if (incomingRefreshToken !== recycler.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }


    try {
        const options = {
            httpOnly: true,
            secure: true, // set to true if using https
        }

        const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(recycler._id);

        return res
            .status(200)
            .cookie("accessToken", AccessToken, options)
            .cookie("refreshToken", RefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: AccessToken, refreshToken: RefreshToken
                    },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

export {
    registerRecycler,
    loginRecycler,
    logoutRecycler,
    refreshAccessToken,
};