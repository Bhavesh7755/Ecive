import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
    wasteType: { type: String, required: true },         // e.g., electronics, plastic, metal
    category: { type: String },                          // e.g., laptop, smartphone
    brand: { type: String },
    model: { type: String },
    condition: { type: String },                         // e.g., working, damaged, partially working
    quantity: { type: Number, default: 1, min: 1 },
    description: { type: String, maxLength: 500 },
    images: [{ type: String }],                          // store image URLs
    aiSuggestedPrice: { type: Number },                 // AI analysis price
    aiConditionScore: { type: Number },                 // AI analysis score for product condition
    aiConfidence: { type: Number }                      // AI confidence percentage
});

const postSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        recycler: { type: mongoose.Schema.Types.ObjectId, ref: 'Recycler' },
        products: [productSchema],                        // multiple products per post
        negotiationHistory: [
            {
                sender: { type: String },                // 'user' or 'recycler'
                message: { type: String },
                priceOffer: { type: Number },
                timestamp: { type: Date, default: Date.now }
            }
        ],
        negotiatedPrice: { type: Number },
        status: {
            type: String,
            enum: ['pending', 'finalized', 'collected', 'completed'],
            default: 'pending'
        },
        userLocation: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
        },
        recyclerLocation: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] } // optional
        }
    },
    { timestamps: true }
);

export const Post = mongoose.model('Post', postSchema);