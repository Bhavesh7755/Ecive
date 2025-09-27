import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;// if no file path provided

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // this will automatically detect the file type (image, video, etc.)
            folder: "ecive", // optional folder name in cloudinary
        })

        // file has been uploaded successfull
        // console.log("file uploaded on cloudinary: ",response.url);

        // remove the file from local uploads folder
        fs.unlinkSync(localFilePath);

        return response;
    }
    catch (error) {
        fs.unlinkSync(localFilePath);// if some error occurs, remove the file from local uploads folder
        return null;
    }
}

export { uploadOnCloudinary };