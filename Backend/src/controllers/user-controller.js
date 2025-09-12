import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    if(!createUser){
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(200, createUser, "User registered Successfully")
    );
});

export {
    registerUser,
};