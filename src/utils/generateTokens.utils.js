import logger from "../logger/index.js";
import { ApiError } from "./apiError.utils.js"

export const generateTokens = async (user) => {
    try{
        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();
        return {accessToken, refreshToken};
    }catch(error){
        logger.info(error.stack);
        throw new ApiError(500, "Error in generating tokens");
    }
};