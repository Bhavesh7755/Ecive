// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "ecive",
    });

    // Try to remove the temp file, ignore errors
    try {
      await fs.unlink(localFilePath);
    } catch (e) {
      // log, but don't throw
      console.warn('Warning: failed to remove temp file', localFilePath, e?.message);
    }

    return response;
  } catch (error) {
    // try to unlink even on error
    try { await fs.unlink(localFilePath); } catch (e) { /* ignore */ }
    console.error('Cloudinary upload error:', error?.message || error);
    return null;
  }
};

export { uploadOnCloudinary };