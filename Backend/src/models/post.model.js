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
      type: [
        productSchema
      ],
      required: true
    },
    userAcceptedAIPrice: {
      type: Boolean,
      default: false
    },
    negotiationHistory: [
      {
        sender: {
          type: String,
          enum: [
            'user',
            'recycler',
            'system'
          ],
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
    userLocation: {
      type: {
        type: String,
        enum: [
          'Point'
        ],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      } // [lng, lat]
    },
    comments: {
      type: String
    },
    tags: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

postSchema.index(
  {
    userLocation: '2dsphere'
  }
);

export const Post = mongoose.model('Post', postSchema);