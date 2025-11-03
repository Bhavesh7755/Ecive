// models/recycler.model.js
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const recyclerSchema = new Schema({
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
    shopName: { type: String, required: true },
    shopImage: { type: String, required: true },
    identity: { type: String, required: true },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    refreshToken: { type: String },

}, { timestamps: true });


// password hashing
recyclerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

recyclerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

recyclerSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' });
};

recyclerSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d' });
};

export const Recycler = mongoose.model("Recycler", recyclerSchema);