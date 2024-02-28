import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import logger from "../logger/index.js";
import { ApiError } from "./apiError.utils.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    resource_type: "auto"
};

export const uploadOnCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, options);
        logger.info(`file has been uploaded on cloudinary ${response.url}`);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        logger.info(error.stack);
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export const destroyFromCloudinary = async (publicId) => {
    try {
        return await cloudinary.uploader.destroy(publicId, {resource_type: "image"});
    } catch (error) {
        logger.info(error.stack);
        throw new ApiError(500, error.message);
    }
};
