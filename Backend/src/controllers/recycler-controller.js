import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Recycler } from "../models/recycler.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import jwt from "jsonwebtoken";

// Generate tokens for recycler
const generateAccessAndRefreshToken = async (recyclerId) => {
    try {
        const recycler = await Recycler.findById(recyclerId);
        const accessToken = recycler.generateAccessToken();
        const refreshToken = recycler.generateRefreshToken();

        //  Save refreshToken in DB
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

    //  Check if all fields are present
    if (!username || !fullName || !email || !mobile || !password || !AddressLine1 || !AddressLine2 || !city || !state || !pincode || !shopName) {
        throw new ApiError(400, "All fields are required");
    }

    //  Check if recycler already exists
    const existingRecycler = await Recycler.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }, { mobile }]
    });
    if (existingRecycler) {
        throw new ApiError(409, "Recycler with this username, email, or mobile already exists");
    }

    //  Upload avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) throw new ApiError(500, "Avatar upload failed");

    //  Upload shop image
    const shopImageLocalPath = req.files?.shopImage?.[0]?.path;
    if (!shopImageLocalPath) throw new ApiError(400, "Shop Image is required");
    const shopImage = await uploadOnCloudinary(shopImageLocalPath);
    if (!shopImage?.url) throw new ApiError(500, "Shop image upload failed");

    //  Upload identity proof
    const identityProofLocalPath = req.files?.identity?.[0]?.path;
    if (!identityProofLocalPath) throw new ApiError(400, "Identity Proof is required");
    const identityProof = await uploadOnCloudinary(identityProofLocalPath);
    if (!identityProof?.url) throw new ApiError(500, "Identity proof upload failed");

    //  Create recycler
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

    //  Generate tokens and save refresh token in DB
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(recycler._id);

    //  Remove sensitive fields
    const createdRecycler = await Recycler.findById(recycler._id).select("-password -refreshToken");

    //  Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development", // only secure in prod
        sameSite: "strict"
    };

    //  Return response with tokens
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

    //  Validation
    if ((!email && !username) || !password) {
        throw new ApiError(400, "Email/Username and password are required to login");
    }

    //  Find recycler by email or username
    const recycler = await Recycler.findOne({
        $or: [
            { email: email?.toLowerCase() },
            { username: username?.toLowerCase() }
        ]
    });

    if (!recycler) {
        throw new ApiError(404, "No recycler found with this email or username");
    }

    //  Verify password
    const isPasswordValid = await recycler.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    //  Generate new tokens (refreshToken saved in DB inside this function)
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(recycler._id);

    //  Exclude sensitive fields
    const loggedInRecycler = await Recycler.findById(recycler._id).select("-password -refreshToken");

    //  Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development", // only true in prod
        sameSite: "strict"
    };

    //  Send response
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
    // 1️ Get the refresh token from cookie or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "No refresh token provided. Please login first.");
    }

    // 2️ Verify the refresh token
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("decodedToken:", decodedToken);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    // 3️ Find recycler by ID stored in token
    const recycler = await Recycler.findById(decodedToken?._id);

    if (!recycler) {
        throw new ApiError(401, "Invalid refresh token or recycler does not exist");
    }

    // 4️ Check if refresh token matches the one stored in DB
    if (incomingRefreshToken !== recycler.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or already used");
    }

    // 5️ Generate new access and refresh tokens
    try {
        const options = {
            httpOnly: true,
            secure: true, // set to true if using https
            sameSite: "strict"
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(recycler._id);

        // 6️ Send new tokens in cookies and response
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



/**
 *  1. Get all requests sent to this recycler
 */
export const getRecyclerRequests = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler._id; // ✔ recycler taken from token

    const posts = await Post.find({ 
        "requests.recycler": recyclerId 
    }).populate("user", "fullName mobile email avatar city") // user info
    .lean();

    const pendingRequests = [];

    posts.forEach(post => {
        post.requests.forEach(req => {
            if (req.recycler.toString() === recyclerId.toString() &&
                req.status === "pending") {
                
                pendingRequests.push({
                    requestId: req._id,
                    postId: post._id,
                    products: post.products,
                    sentAt: req.sentAt,
                    userAddress: post.userAddress,
                    postStatus: post.status,
                    // Extra metadata the recycler MUST SEE
                    createdAt: post.createdAt,
                    user: post.user,
                });
            }
        });
    });

    return res.status(200).json(
        new ApiResponse(200, pendingRequests, "Recycler requests fetched")
    );
});



export const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId, action } = req.params;
    const { finalPrice } = req.body || {};
    const recyclerId = req.recycler._id;

    if (!["accept", "reject"].includes(action)) {
        throw new ApiError(400, "Invalid action. Must be accept or reject.");
    }

    const post = await Post.findOne({ "requests._id": requestId });
    if (!post) throw new ApiError(404, "Request not found.");

    const request = post.requests.id(requestId);
    if (!request.recycler.equals(recyclerId)) throw new ApiError(403, "Not authorized.");

    if (action === "accept") {
        request.status = "accepted";
        if (finalPrice) {
            post.negotiatedPrice = finalPrice;
            post.isPriceFinalized = true;
        }
        post.status = "negotiation";
        post.recycler = recyclerId;
    } else if (action === "reject") {
        request.status = "rejected";
    }

    await post.save();
    res.status(200).json(new ApiResponse(200, request, `Request ${action}ed successfully`));
});

// GET /recyclers/profile
export const getRecyclerProfile = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.recycler));
});

export const updateRecyclerProfile = asyncHandler(async (req, res) => {
    Object.assign(req.recycler, req.body);
    await req.recycler.save();
    res.status(200).json(new ApiResponse(200, req.recycler, "Profile updated successfully"));
});

// ---------------------
// Notifications
// ---------------------
export const getRecyclerNotifications = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler._id;

    const posts = await Post.find({ "requests.recycler": recyclerId, "requests.status": "pending" })
        .select("requests user createdAt");

    const notifications = [];
    posts.forEach(post => {
        post.requests.forEach(request => {
            if (request.recycler.toString() === recyclerId.toString() && request.status === "pending") {
                notifications.push({
                    notificationId: request._id,
                    postId: post._id,
                    user: post.user,
                    sentAt: request.sentAt,
                    message: `New request for post ${post._id}`
                });
            }
        });
    });

    res.status(200).json(new ApiResponse(200, notifications));
});

export const markRecyclerNotificationAsRead = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler._id;
    const { notificationId } = req.params;

    const post = await Post.findOne({ "requests._id": notificationId });
    if (!post) throw new ApiError(404, "Notification not found");

    const request = post.requests.id(notificationId);
    if (!request || request.recycler.toString() !== recyclerId.toString()) throw new ApiError(404, "Notification not found");

    request.status = "expired";
    await post.save();

    res.status(200).json(new ApiResponse(200, request, "Notification marked as read"));
});

// ---------------------
// Earnings
// ---------------------
export const getRecyclerEarnings = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler._id;

    const posts = await Post.find({ recycler: recyclerId, status: "completed" });

    const totalEarnings = posts.reduce((sum, post) => {
        if (post.isPriceFinalized && post.negotiatedPrice) return sum + post.negotiatedPrice;
        return sum;
    }, 0);

    res.status(200).json(new ApiResponse(200, { totalEarnings }));
});

// ---------------------
// Orders
// ---------------------
// GET Orders for Recycler with status filtering
export const getRecyclerOrders = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler?._id;
    const status = req.query.status || "all";

    if (!recyclerId) {
        throw new ApiError(401, "Unauthorized");
    }

    // 🔹 Base filter: orders accepted by this recycler
    const filter = {
        recycler: recyclerId,
        status: { $ne: "waitingRecycler" } // ❌ exclude new requests
    };

    // 🔹 Apply status filter only if not "all"
    if (status !== "all") {
        filter.status = status;
    }

    const orders = await Post.find(filter)
        .populate(
            "user",
            "fullName email mobile city state AddressLine1 AddressLine2 pincode avatar"
        )
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, orders, "Recycler orders fetched successfully")
        );
});



// ✅ GET Dashboard Stats for Recycler
export const getRecyclerDashboardStats = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler?._id;

    if (!recyclerId) {
        throw new ApiError(401, "Unauthorized access");
    }

    // ✅ Count Orders assigned to recycler
    const totalOrders = await Post.countDocuments({ recycler: recyclerId });

    // ✅ Count pending requests (status = pending)
    const pendingRequests = await Post.countDocuments({
        recycler: recyclerId,
        status: "waitingRecycler"
    });

    // ✅ Count accepted requests (status = negotiation / finalized / collected / completed)
    const acceptedRequests = await Post.countDocuments({
        recycler: recyclerId,
        status: { $in: ["negotiation", "finalized", "collected", "completed"] }
    });

    // ✅ Earnings from completed posts: 10% commission
    const completedOrders = await Post.find({
        recycler: recyclerId,
        status: "completed"
    });

    let totalEarnings = 0;
    completedOrders.forEach(post => {
        const price = post.negotiatedPrice || post.aiSuggestedPrice || 0;
        totalEarnings += price * 0.10;
    });

    const stats = {
        totalOrders,
        pendingRequests,
        acceptedRequests,
        totalEarnings: Math.round(totalEarnings)
    };

    return res.status(200).json(
        new ApiResponse(200, { stats }, "Recycler Dashboard Stats fetched successfully")
    );
});

// ---------------------
// Recycler Chat - add message
// ---------------------
export const addRecyclerChatMessage = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler?._id;
    const postId = req.params.id;
    const { message, priceOffer } = req.body;

    if (!recyclerId) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!message && typeof priceOffer === "undefined") {
        throw new ApiError(400, "message or priceOffer required");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // ensure this recycler is actually assigned to this post
    if (!post.recycler || post.recycler.toString() !== recyclerId.toString()) {
        throw new ApiError(403, "You are not assigned to this order");
    }

    post.negotiationHistory.push({
        sender: "recycler",
        message,
        priceOffer,
        createdAt: new Date(),
    });

    await post.save();

    return res
        .status(201)
        .json(new ApiResponse(201, post, "Message added"));
});



export const recyclerFinalizePrice = asyncHandler(async (req, res) => {
    const recyclerId = req.recycler?._id;
    const postId = req.params.id;
    const { finalPrice } = req.body;

    if (!recyclerId) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!finalPrice || isNaN(finalPrice)) {
        throw new ApiError(400, "Valid final price required");
    }

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    if (!post.recycler || post.recycler.toString() !== recyclerId.toString()) {
        throw new ApiError(403, "Not assigned to this post");
    }

    post.negotiatedPrice = finalPrice;
    post.isPriceFinalized = true;
    post.status = "finalized";

    // Add system message
    post.negotiationHistory.push({
        sender: "system",
        message: `Recycler finalized price at ₹${finalPrice}`,
        priceOffer: finalPrice,
        createdAt: new Date(),
    });

    await post.save();

    return res.status(200).json(
        new ApiResponse(200, post, "Price finalized successfully")
    );
});


export {
    registerRecycler,
    loginRecycler,
    logoutRecycler,
    refreshAccessToken,
};