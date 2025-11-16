// models/post.model.js
import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
  wasteType: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  brand: {
    type: String
  },
  model: {
    type: String
  },
  conditionDetails: {
    type: Schema.Types.Mixed,
    default: {}
  }, // Q&A answers
  conditionSummary: {
    type: String
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: [
    {
      type: String // cloudinary URLs
    }
  ],
  aiSuggestedPrice: {
    type: Number
  },
  aiConditionScore: {
    type: Number
  },  // 0-100
  aiConfidence: {
    type: Number
  }        // 0-100
},
  {
    _id: false
  }
);

const requestSchema = new Schema(
  {
    recycler: { type: Schema.Types.ObjectId, ref: 'Recycler', required: true },
    products: [
      {
        wasteType: String,
        brand: String,
        model: String,
        aiSuggestedPrice: Number,
        aiConditionScore: Number,
        aiConfidence: Number,
        quantity: Number,
      },
    ],
    sentAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  { _id: true }
);

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recycler: {
      type: Schema.Types.ObjectId,
      ref: 'Recycler'
    }, // selected recycler

    products: {
      type: [productSchema],
      required: true
    },

    // ✅ New address fields (instead of userLocation)
    userAddress: {
      type: String,
      required: true,
    },


    userAcceptedAIPrice: {
      type: Boolean,
      default: false
    },
    negotiationHistory: [
      {
        sender: {
          type: String,
          enum: ['user', 'recycler', 'system'],
          required: true
        },
        message: {
          type: String
        },
        priceOffer: {
          type: Number
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    negotiatedPrice: {
      type: Number
    },
    isPriceFinalized: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: [
        'pending',
        'aiSuggested',
        'waitingRecycler',
        'negotiation',
        'finalized',
        'collected',
        'completed',
        'cancelled'
      ],
      default: 'pending'
    },
    collectedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    comments: {
      type: String
    },
    tags: [
      {
        type: String
      }
    ],

    // ✅ New request tracking fields
    requests: { type: [requestSchema], default: [] },

    // ✅ Newly added fields for recycler request tracking
    requestSentAt: {
      type: Date
    },
    requestStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired', null],
      default: 'pending'
    },
  },
  {
    timestamps: true
  }
);

export const Post = mongoose.model('Post', postSchema);