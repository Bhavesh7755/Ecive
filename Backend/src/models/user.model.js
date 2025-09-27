// models/user.model.js
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    fullName: { type: String, required: true, trim: true, index: true },
    avatar: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: [true, 'Password is required'] },
    mobile: { type: Number, limit: 10, required: true, unique: true },
    AddressLine1: { type: String, required: true },
    AddressLine2: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    refreshToken: { type: String },

    // New: userLocation for geo queries (store [lng, lat])
    userLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
        address: { type: String } // optional formatted address
    }
}, { timestamps: true });

// index for geospatial queries
userSchema.index({ userLocation: '2dsphere' });

// password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d' });
};

export const User = mongoose.model("User", userSchema);