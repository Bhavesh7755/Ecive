import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createPost,
  uploadImages,
  getNearbyRecyclers,
  selectRecycler,
  addChatMessage,
  getMyPosts,
  acceptAIPrice,
  finalizePrice,
  getPostById,
  updatePostStatus
} from '../controllers/post.controller.js';

const router = Router();

// Upload images (for items)
router.post('/upload-images', verifyJWT, uploadImages);

// Create new post with product details
router.post('/create', verifyJWT, createPost);

// Get posts of logged-in user
router.get('/my-posts', verifyJWT, getMyPosts);

// Get nearby recyclers by location
router.get('/nearby-recyclers',verifyJWT, getNearbyRecyclers); // public

// Select recycler for a post
router.post('/:id/select-recycler', verifyJWT, selectRecycler);

// Chat messages (send message / negotiation)
router.post('/:id/add-message', verifyJWT, addChatMessage);

// Accept AI suggested price
router.post('/:id/accept-ai-price', verifyJWT, acceptAIPrice);

// Finalize negotiated price
router.post('/:id/finalize-price', verifyJWT, finalizePrice);

// Get single post details
router.get('/:id', verifyJWT, getPostById);

// Update post status (collected/completed etc.)
router.patch('/:id/status', verifyJWT, updatePostStatus);

export default router;