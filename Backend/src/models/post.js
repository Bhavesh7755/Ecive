import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema(
    {
        wastetype: [
            {
                type: String,
                required: true,
            } // e.g. plastic, metal, paper, electronics
        ],
        quantity: {
            type: Number,
            required: true,
            min: 1, // minimum quantity should be 1 kg
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 500,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recycler: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recycler',
        }
    },
    {
        timestamps: true,
    }
)

export const Post = mongoose.model("Post", postSchema);