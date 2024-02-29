import Jwt from 'jsonwebtoken';
import { ApiError } from "../utils/apiError.utils.js";
import UserModel from '../models/user.models.js';
import logger from '../logger/index.js';

export const verifyAccessToken = async (req, res, next) => {
    logger.info('....auth.middlewares-verifyJwt  starts....')
    try {
        const token = req.cookie?.accessToken || req.header("Authorization")?.split(" ")[1];

        if (!token)
            throw new ApiError(401, "unauthorized access request")

        const decodedAccessToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await UserModel.findById(decodedAccessToken._id).select("-password -__v");

        if (!user || !user.refreshToken)
            throw new ApiError(401, "invalid token or session expired");

        const decodedRefreshToken = Jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET);

        if(decodedAccessToken.iat < decodedRefreshToken.iat)
            throw new ApiError(401, "session refreshed already");

        user.refreshToken = undefined;
        req.user = user;

        next();

    } catch (error) {

        logger.info(error.stack);
        error = new ApiError(error?.statusCode || 401, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('....auth.middlewares-verifyJwt  ends....')
};