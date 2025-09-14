import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// generating the access token and refresh token method for login
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken; // save the refresh token in the user document or database
        await user.save({ validateBeforeSave: false }); // save the user document with the new refresh token

        return { accessToken, refreshToken };

    } catch (erro) {
        throw new ApiError(500, "Error Something while  generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from fronted
    const { fullName, username, email, password, mobile, city, state, pincode, AddressLine1, AddressLine2 } = req.body;

    console.log("email: ", email);

    // validation- not empty
    if ([fullName, username, email, password, mobile, city, state, pincode, AddressLine1, AddressLine2].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists by username and email and phone
    const exitUser = await User.findOne({
        $or: [{ username }, { email }, { mobile }]
    });

    if (exitUser) {
        throw new ApiError(400, "User already exits with this username or email or phone");
    }

    // upload avatar on cloudinary
    // check for images or avatar

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // now upload the avatar from local to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Error in uploading avatar");
    }

    // create user object
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

    // remove password and refreshToken from user object before sending the response
    const createUser = await User.findById(user._id).select("-password -refreshToken");

    // check for user creation
    if (!createUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(200, createUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required to login");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(400, "User not found with this username or email");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    console.log("isPasswordValid: ", isPasswordValid);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true, // only send cookie over https
    }

    return res.status(200).cookie("accessToken", accessToken, options).json(
        new ApiResponse(
            200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
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
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

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
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; // get the refresh token from the cookie or request body from user side

    if (!incomingRefreshToken) {
        throw new ApiError(401, "No refresh token provided, please login first or Unauthorized request");
    }

    // verify the refresh token
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Invalid refresh token or user does not exist");
    }


    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }


    try {
        const options = {
            httpOnly: true,
            secure: true, // set to true if using https
        }

        const { newAccessToken, newRefreshToken } = await generateAccessToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: newAccessToken, refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetched successfully"); // req.user is coming from the verifyJWT middleware so that we have to use that middleware in the route and we can access the req.user
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    // 1. get user details from req.body
    const { fullName, email, AddressLine1, AddressLine2, state, pincode, city } = req.body;

    // 2. check if user details are not empty
    if ([fullName, email, city, state, pincode, AddressLine1, AddressLine2].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. check if user is exist and update details
    const user = await User.findByIdAndUpdate(
        req, user?._id,
        {
            $set: {
                fullName: fullName,
                email: email,
                AddressLine1: AddressLine1,
                AddressLine2: AddressLine2,
                state: state,
                pincode: pincode,
                city: city,
            }
        },
        { new: true } // return the updated user documnet
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
})

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