// controllers/post.controller.js - UPDATED FOR ADDRESS INSTEAD OF LOCATION
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import { Recycler } from '../models/recycler.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------------------- GEMINI AI FUNCTION ---------------------- */
async function callGeminiAIForProduct(product, city) {
  const prompt = `
You are an expert e-waste valuation assistant for India.
Based on the product details, estimate a fair recycling price in INR for ${city}.
Consider current market rates, condition, and brand value.

Product Details:
- Type: ${product.wasteType || 'Unknown'}
- Category: ${product.category || 'Unknown'}  
- Brand: ${product.brand || 'Unknown'}
- Model: ${product.model || 'Unknown'}
- Quantity: ${product.quantity || 1}
- Condition: ${JSON.stringify(product.conditionDetails || {})}
- Description: ${product.description || 'No description'}

Return ONLY valid JSON in this format:
{"price": <number>, "conditionScore": <0-100>, "confidence": <0-100>, "explanation": "<reason>"}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let json = null;
    try {
      json = JSON.parse(text.trim());
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) json = JSON.parse(match[0]);
    }

    if (json && json.price) {
      return {
        aiSuggestedPrice: Math.max(Number(json.price) || 0, 0),
        aiConditionScore: Math.min(Math.max(Number(json.conditionScore) || 0, 0), 100),
        aiConfidence: Math.min(Math.max(Number(json.confidence) || 0, 0), 100),
        aiExplanation: String(json.explanation || '').slice(0, 500)
      };
    }

    const fallbackPrice = getFallbackPrice(product);
    return {
      aiSuggestedPrice: fallbackPrice,
      aiConditionScore: 50,
      aiConfidence: 40,
      aiExplanation: 'AI parsing failed, using fallback pricing.'
    };

  } catch (error) {
    console.error('Gemini AI Error:', error);
    const fallbackPrice = getFallbackPrice(product);
    return {
      aiSuggestedPrice: fallbackPrice,
      aiConditionScore: 40,
      aiConfidence: 30,
      aiExplanation: 'AI service unavailable, using fallback pricing.'
    };
  }
}

/* ---------------------- FALLBACK PRICE ---------------------- */
function getFallbackPrice(product) {
  const wasteType = (product.wasteType || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const quantity = product.quantity || 1;

  let basePrice = 100;

  if (wasteType.includes('electronics')) {
    if (category.includes('mobile') || category.includes('phone')) {
      basePrice = brand.includes('apple') || brand.includes('samsung') ? 2000 : 800;
    } else if (category.includes('laptop') || category.includes('computer')) {
      basePrice = 3000;
    } else if (category.includes('tv') || category.includes('monitor')) {
      basePrice = 1500;
    } else if (category.includes('washing machine') || category.includes('refrigerator')) {
      basePrice = 2500;
    } else {
      basePrice = 500;
    }
  } else if (wasteType.includes('metal')) basePrice = 50 * quantity;
  else if (wasteType.includes('plastic')) basePrice = 20 * quantity;
  else if (wasteType.includes('paper')) basePrice = 15 * quantity;

  const conditionScore = product.conditionDetails?.score || 50;
  return Math.round(basePrice * (conditionScore / 100));
}

/* ---------------------- IMAGE UPLOAD ---------------------- */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, "No files uploaded");

  const uploadedUrls = await Promise.all(
    req.files.map(async (file) => {
      try {
        const uploaded = await uploadOnCloudinary(file.path);
        return uploaded?.secure_url || null;
      } catch (err) {
        console.error("Cloudinary upload failed for", file.path, err);
        return null;
      }
    })
  );

  const validUrls = uploadedUrls.filter((url) => url !== null);
  return res.status(200).json(new ApiResponse(200, { urls: validUrls }, "Images uploaded successfully"));
});

/* ---------------------- CREATE POST ---------------------- */
export const createPost = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const { products, userAddress } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0)
    throw new ApiError(400, 'Products array is required');

  if (!userAddress || typeof userAddress !== 'string')
    throw new ApiError(400, 'Valid userAddress (string) is required');

  const post = new Post({
    user: userId,
    products: products.map((p) => ({
      ...p,
      images: p.images || [],
    })),
    userAddress,
    status: 'pending',
  });

  await post.save();

  await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });

  const userCity = req.user?.city || 'your area';

  const aiResults = await Promise.all(
    post.products.map(async (p) => {
      try {
        const ai = await callGeminiAIForProduct(p, userCity);
        return ai;
      } catch (err) {
        console.error('AI error for product:', p, err);
        return {
          aiSuggestedPrice: null,
          aiConditionScore: null,
          aiConfidence: null,
          aiExplanation: 'AI failed to generate suggestions',
        };
      }
    })
  );

  aiResults.forEach((ai, i) => {
    post.products[i].aiSuggestedPrice = ai.aiSuggestedPrice;
    post.products[i].aiConditionScore = ai.aiConditionScore;
    post.products[i].aiConfidence = ai.aiConfidence;
    post.products[i].aiExplanation = ai.aiExplanation;
  });

  post.status = 'aiSuggested';
  await post.save();

  console.log(`User ${req.user?.email} created a post in ${userCity}. Awaiting recycler selection.`);

  return res.status(201).json(new ApiResponse(201, post, 'Post created and AI analysis completed'));
});


export const getNearbyRecyclers = asyncHandler(async (req, res) => {
  // get city from query instead of req.user
  const userCity = req.query.city;
  if (!userCity) throw new ApiError(400, 'User city not found');

  const recyclers = await Recycler.find({ city: userCity }).select('-password -refreshToken');

  return res.status(200).json(
    new ApiResponse(200, recyclers, `Recyclers from city: ${userCity} fetched`)
  );
});


/* ---------------------- SELECT RECYCLER ---------------------- */
export const selectRecycler = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params.id;
  const { recyclerId } = req.body;

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!recyclerId) throw new ApiError(400, 'recyclerId is required');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.user.toString() !== userId.toString()) throw new ApiError(403, 'You are not owner of this post');

  const recycler = await Recycler.findById(recyclerId);
  if (!recycler) throw new ApiError(404, 'Recycler not found');

  post.recycler = recyclerId;
  post.status = 'negotiation';
  await post.save();

  await Recycler.findByIdAndUpdate(recyclerId, { $push: { posts: post._id } });

  return res.status(200).json(new ApiResponse(200, post, 'Recycler selected and negotiation started'));
});



// Get recycler by ID
export const getRecyclerById = asyncHandler(async (req, res) => {
  const recyclerId = req.params.id;
  const recycler = await Recycler.findById(recyclerId).select('-password -refreshToken');
  if (!recycler) throw new ApiError(404, 'Recycler not found');

  res.status(200).json({
    statusCode: 200,
    success: true,
    data: recycler,
    message: 'Recycler fetched successfully',
  });
});

export const sendRequestToRecycler = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params.id;
  const { recyclerId, products } = req.body; // products: array with details + AI price

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!recyclerId) throw new ApiError(400, 'recyclerId is required');
  if (!products || !Array.isArray(products) || products.length === 0)
    throw new ApiError(400, 'Products are required');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.user.toString() !== userId.toString()) throw new ApiError(403, 'You are not owner of this post');

  const recycler = await Recycler.findById(recyclerId);
  if (!recycler) throw new ApiError(404, 'Recycler not found');

  // Save the request info in a new field inside Post or create a new Request collection
  // post.requests = post.requests || [];
  // post.requests.push({
  //   recycler: recyclerId,
  //   products,
  //   sentAt: new Date(),
  //   status: 'pending',
  // });


  if (!Array.isArray(post.requests)) {
  post.requests = [];
}
  post.requests.push({
    recycler: recyclerId,
    products,
    sentAt: new Date(),
    status: 'pending',
  });

  // Update post status and request info
  post.status = 'waitingRecycler';
  post.requestSentAt = new Date();
  post.requestStatus = 'pending';

  await post.save();

  // Optional: Add request reference in Recycler model
  recycler.requests = recycler.requests || [];
  recycler.requests.push({
    post: postId,
    products,
    status: 'pending',
  });

  await recycler.save();

  return res.status(200).json({
    success: true,
    message: 'Request sent to recycler successfully',
    data: { postId, recyclerId, products }
  });
}); 


/* ---------------------- ADD MESSAGE TO POST ---------------------- */
export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    throw new ApiError(400, "Message cannot be empty");
  }

  const post = await Post.findById(id);
  if (!post) throw new ApiError(404, "Post not found");

  let senderRole = "";
  if (post.user.toString() === userId.toString()) senderRole = "user";
  else if (post.recycler && post.recycler.toString() === userId.toString())
    senderRole = "recycler";
  else throw new ApiError(403, "Not authorized to send message");

  post.messages.push({
    sender: senderRole,
    text,
    timestamp: new Date(),
  });

  await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, post.messages, "Message added"));
});



/* ---------------------- CHAT MESSAGE ---------------------- */
export const addChatMessage = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params.id;
  const { message, priceOffer } = req.body;

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!message && typeof priceOffer === 'undefined')
    throw new ApiError(400, 'message or priceOffer required');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  let sender = null;
  if (post.user && userId.toString() === post.user.toString()) sender = 'user';
  else if (post.recycler && userId.toString() === post.recycler.toString()) sender = 'recycler';
  else throw new ApiError(403, 'You are not part of this negotiation');

  post.negotiationHistory.push({ sender, message, priceOffer });
  await post.save();

  return res.status(201).json(new ApiResponse(201, post, 'Message added'));
});

/* ---------------------- GET MY POSTS ---------------------- */
export const getMyPosts = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const posts = await Post.find({ user: userId })
    .populate('recycler', 'shopName city avatar email')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, posts, 'User posts fetched'));
});

/* ---------------------- ACCEPT AI PRICE ---------------------- */
export const acceptAIPrice = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params.id; 

  if (!userId) throw new ApiError(401, 'Unauthorized');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.user.toString() !== userId.toString()) throw new ApiError(403, 'Not authorized');

  post.userAcceptedAIPrice = true;
  post.status = 'waitingRecycler';
  await post.save();

  return res.status(200).json(new ApiResponse(200, post, 'AI price accepted, waiting for recycler selection'));
});

/* ---------------------- FINALIZE PRICE ---------------------- */
export const finalizePrice = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params.id;
  const { finalPrice } = req.body;

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!finalPrice) throw new ApiError(400, 'finalPrice is required');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  let isAuthorized = false;
  if (post.user.toString() === userId.toString()) isAuthorized = true;
  if (post.recycler && post.recycler.toString() === userId.toString()) isAuthorized = true;

  if (!isAuthorized) throw new ApiError(403, 'Not authorized');

  const aiPrice = post.products.reduce((total, p) => total + (p.aiSuggestedPrice || 0), 0);
  const minPrice = aiPrice * 0.9;
  const maxPrice = aiPrice * 1.1;

  if (finalPrice < minPrice || finalPrice > maxPrice)
    throw new ApiError(400, `Final price must be between ₹${minPrice} and ₹${maxPrice} (±10% of AI price)`);

  post.negotiatedPrice = finalPrice;
  post.isPriceFinalized = true;
  post.status = 'finalized';
  await post.save();

  return res.status(200).json(new ApiResponse(200, post, 'Price finalized successfully'));
});

/* ---------------------- GET POST BY ID ---------------------- */
export const getPostById = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, 'Unauthorized');

  const post = await Post.findById(postId)
    .populate('user', 'fullName avatar email mobile city')
    .populate('recycler', 'shopName avatar email mobile rating city');

  if (!post) throw new ApiError(404, 'Post not found');

  let hasAccess = false;
  if (post.user._id.toString() === userId.toString()) hasAccess = true;
  if (post.recycler && post.recycler._id.toString() === userId.toString()) hasAccess = true;

  if (!hasAccess) throw new ApiError(403, 'Not authorized to view this post');

  return res.status(200).json(new ApiResponse(200, post, 'Post details fetched'));
});

/* ---------------------- UPDATE STATUS ---------------------- */
export const updatePostStatus = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user?._id;
  const { status } = req.body;

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!status) throw new ApiError(400, 'Status is required');

  const validStatuses = [
    'pending',
    'aiSuggested',
    'waitingRecycler',
    'negotiation',
    'finalized',
    'collected',
    'completed',
    'cancelled',
  ];
  if (!validStatuses.includes(status)) throw new ApiError(400, 'Invalid status');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  let isAuthorized = false;
  if (post.user.toString() === userId.toString()) isAuthorized = true;
  if (post.recycler && post.recycler.toString() === userId.toString()) isAuthorized = true;

  if (!isAuthorized) throw new ApiError(403, 'Not authorized');

  post.status = status;
  if (status === 'collected') post.collectedAt = new Date();
  else if (status === 'completed') post.completedAt = new Date();

  await post.save();

  return res.status(200).json(new ApiResponse(200, post, 'Post status updated'));
});