// controllers/post.controller.js - COMPLETE VERSION
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import { Recycler } from '../models/recycler.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Fixed import

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Enhanced AI function with better error handling
 */
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let json = null;
    try {
      json = JSON.parse(text.trim());
    } catch (e) {
      // Extract JSON from text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        json = JSON.parse(match[0]);
      }
    }

    if (json && json.price) {
      return {
        aiSuggestedPrice: Math.max(Number(json.price) || 0, 0),
        aiConditionScore: Math.min(Math.max(Number(json.conditionScore) || 0, 0), 100),
        aiConfidence: Math.min(Math.max(Number(json.confidence) || 0, 0), 100),
        aiExplanation: String(json.explanation || '').slice(0, 500)
      };
    }

    // Fallback pricing
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

/**
 * Enhanced fallback pricing logic
 */
function getFallbackPrice(product) {
  const wasteType = (product.wasteType || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const quantity = product.quantity || 1;

  let basePrice = 100; // Default base price

  // Waste type pricing
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
      basePrice = 500; // Other electronics
    }
  } else if (wasteType.includes('metal')) {
    basePrice = 50 * quantity; // Per kg
  } else if (wasteType.includes('plastic')) {
    basePrice = 20 * quantity; // Per kg
  } else if (wasteType.includes('paper')) {
    basePrice = 15 * quantity; // Per kg
  }

  // Apply condition modifier
  const conditionScore = product.conditionDetails?.score || 50;
  return Math.round(basePrice * (conditionScore / 100));
}

/**
 * Upload images endpoint (multipart) - YOUR ORIGINAL FUNCTION
 */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  const urls = [];

  for (const f of req.files) {
    const result = await uploadOnCloudinary(f.path);

    if (!result || !result.url) {
      throw new ApiError(500, "Image upload failed");
    }

    urls.push(result.url);
  }

  return res.status(200).json(
    new ApiResponse(200, { urls }, "Images uploaded successfully")
  );
});

/**
 * Create a post (protected) - ENHANCED VERSION
 */
export const createPost = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { products, userLocation } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, 'Products array is required');
  }

  // Validate location
  if (!userLocation?.lat || !userLocation?.lng) {
    throw new ApiError(400, 'Valid userLocation with lat and lng is required');
  }

  // Build post object
  const post = new Post({
    user: userId,
    products,
    userLocation: {
      type: 'Point',
      coordinates: [Number(userLocation.lng), Number(userLocation.lat)]
    },
    status: 'pending'
  });

  // Save early so we have an id
  await post.save();

  // Attach this post to user's posts array
  await User.findByIdAndUpdate(
    userId, 
    { $push: { posts: post._id } }, 
    { new: true }
  );

  const userCity = req.user?.city || 'your area';

  // For each product call Gemini AI and attach results
  for (let i = 0; i < post.products.length; i++) {
    const p = post.products[i];
    console.log(`Calling AI for product ${i}:`, p);

    const ai = await callGeminiAIForProduct(p, userCity);
    console.log(`AI for product ${i}:`, ai);

    // attach to product
    post.products[i].aiSuggestedPrice = ai.aiSuggestedPrice;
    post.products[i].aiConditionScore = ai.aiConditionScore;
    post.products[i].aiConfidence = ai.aiConfidence;
    post.products[i].aiExplanation = ai.aiExplanation;
  }

  post.status = 'aiSuggested';
  await post.save();

  // Notify user
  console.log(`User ${req.user?.email} created a post in ${userCity}. Awaiting recycler selection.`);

  return res.status(201).json(
    new ApiResponse(201, post, 'Post created and AI analysis completed')
  );
});

/**
 * Get nearby recyclers (public) - YOUR ORIGINAL FUNCTION
 */
export const getNearbyRecyclers = asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm || 10);

  if (!lat || !lng) {
    throw new ApiError(400, 'lat and lng are required');
  }

  const maxDistance = radiusKm * 1000; // meters

  const recyclers = await Recycler.find({
    'shopLocation': {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistance
      }
    }
  }).select('-password -refreshToken');

  return res.status(200).json(new ApiResponse(200, recyclers, 'Nearby recyclers fetched'));
});

/**
 * Select a recycler for a post (user) - YOUR ORIGINAL FUNCTION
 */
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

  // add post to recycler.posts if you want
  await Recycler.findByIdAndUpdate(recyclerId, { $push: { posts: post._id } });

  return res.status(200).json(new ApiResponse(200, post, 'Recycler selected and negotiation started'));
});

/**
 * Add chat/negotiation message (user or recycler) - YOUR ORIGINAL FUNCTION
 */
export const addChatMessage = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params.id;
  const { message, priceOffer } = req.body;

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!message && typeof priceOffer === 'undefined') throw new ApiError(400, 'message or priceOffer required');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  // who is sender? user or recycler
  let sender = null;
  if (post.user && userId.toString() === post.user.toString()) sender = 'user';
  else if (post.recycler && userId.toString() === post.recycler.toString()) sender = 'recycler';
  else throw new ApiError(403, 'You are not part of this negotiation');

  post.negotiationHistory.push({ sender, message, priceOffer });
  await post.save();

  return res.status(201).json(new ApiResponse(201, post, 'Message added'));
});

/**
 * Get my posts (for dashboard) - YOUR ORIGINAL FUNCTION
 */
export const getMyPosts = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, 'Unauthorized');

  const posts = await Post.find({ user: userId })
    .populate('recycler', 'shopName shopLocation avatar email')
    .sort({ createdAt: -1 });
    
  return res.status(200).json(new ApiResponse(200, posts, 'User posts fetched'));
});

/**
 * Accept AI Price - NEW FUNCTION I ADDED
 */
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

/**
 * Finalize negotiated price - NEW FUNCTION I ADDED
 */
export const finalizePrice = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const postId = req.params.id;
  const { finalPrice } = req.body;

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!finalPrice) throw new ApiError(400, 'finalPrice is required');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  // Check if user is part of this negotiation
  let isAuthorized = false;
  if (post.user.toString() === userId.toString()) isAuthorized = true;
  if (post.recycler && post.recycler.toString() === userId.toString()) isAuthorized = true;
  
  if (!isAuthorized) throw new ApiError(403, 'Not authorized');

  // Validate price is within ±10% of AI price
  const aiPrice = post.products.reduce((total, p) => total + (p.aiSuggestedPrice || 0), 0);
  const minPrice = aiPrice * 0.9;
  const maxPrice = aiPrice * 1.1;

  if (finalPrice < minPrice || finalPrice > maxPrice) {
    throw new ApiError(400, `Final price must be between ₹${minPrice} and ₹${maxPrice} (±10% of AI price)`);
  }

  post.negotiatedPrice = finalPrice;
  post.isPriceFinalized = true;
  post.status = 'finalized';
  await post.save();

  return res.status(200).json(new ApiResponse(200, post, 'Price finalized successfully'));
});

/**
 * Get post details by ID - NEW FUNCTION I ADDED
 */
export const getPostById = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, 'Unauthorized');

  const post = await Post.findById(postId)
    .populate('user', 'fullName avatar email mobile city')
    .populate('recycler', 'shopName avatar email mobile rating');

  if (!post) throw new ApiError(404, 'Post not found');

  // Check if user has access to this post
  let hasAccess = false;
  if (post.user._id.toString() === userId.toString()) hasAccess = true;
  if (post.recycler && post.recycler._id.toString() === userId.toString()) hasAccess = true;
  
  if (!hasAccess) throw new ApiError(403, 'Not authorized to view this post');

  return res.status(200).json(new ApiResponse(200, post, 'Post details fetched'));
});

/**
 * Update post status - NEW FUNCTION I ADDED  
 */
export const updatePostStatus = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user?._id;
  const { status } = req.body;

  if (!userId) throw new ApiError(401, 'Unauthorized');
  if (!status) throw new ApiError(400, 'Status is required');

  const validStatuses = ['pending', 'aiSuggested', 'waitingRecycler', 'negotiation', 'finalized', 'collected', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  // Check authorization
  let isAuthorized = false;
  if (post.user.toString() === userId.toString()) isAuthorized = true;
  if (post.recycler && post.recycler.toString() === userId.toString()) isAuthorized = true;
  
  if (!isAuthorized) throw new ApiError(403, 'Not authorized');

  post.status = status;
  
  // Set timestamps based on status
  if (status === 'collected') {
    post.collectedAt = new Date();
  } else if (status === 'completed') {
    post.completedAt = new Date();
  }

  await post.save();

  return res.status(200).json(new ApiResponse(200, post, 'Post status updated'));
});