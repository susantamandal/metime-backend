import Jwt from 'jsonwebtoken'

import logger from '../logger/index.js';
import UserModel from "../models/user.models.js";
import { API_REQUEST, URL_AUTH } from '../utils/constants.utils.js'
import { ApiError } from '../utils/apiError.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';
import { generateTokens } from '../utils/generateTokens.utils.js';

// ...............................Log In User.............................

export const login = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_AUTH}/login`);
    logger.info('....login starts....')

    try {

        const { email, password, sessionOverride = false } = req.body;

        if (!email || !password)
            throw new ApiError(400, "email and password are required to login");

        const user = await UserModel.findOne({ email });

        if (!user)
            throw new ApiError(400, "no user found with this email");

        if (!await user.isPasswordCorrect(password))
            throw new ApiError(400, "password does not match");

        if (user.refreshToken) {
            Jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decodedToken) => {
                if (!error && decodedToken?._id === user._id.toString() && !sessionOverride) {
                    throw new ApiError(400, "user already logged in some other session");
                }
            });
        };

        const { accessToken, refreshToken } = await generateTokens(user);
        user.active = true;
        user.lastActiveAt = new Date();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        user.password = undefined;
        user.refreshToken = undefined;

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                user,
                accessToken,
                refreshToken
            }, "login successful"));

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('....login ends....')
}

// ...............................Log Out User.............................

export const logout = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_AUTH}/logout`);
    logger.info('....logout starts....')
    try {
        await UserModel.findByIdAndUpdate(req.user._id, { active: false, lastActiveAt: new Date(), refreshToken: "" });
        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "logout successful!"));

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('....logout ends....')
};

// ...............................Sign Up User.............................

export const signup = async (req, res, next) => {

    logger.info(`${API_REQUEST} ${URL_AUTH}/signup`);
    logger.info('....signup starts....')

    try {
        const user = await UserModel.create(req.body);
        user.password = undefined;
        res.status(201).json(new ApiResponse(201, user, "signup successful"));

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }

    logger.info('....signup ends....')
};


export const generateRefreshToken = async (req, res, next) => {

    logger.info(`${API_REQUEST} ${URL_AUTH}/refreshtoken`);
    logger.info('....generateRefreshToken starts....')

    try {

        const token = req.cookie?.refreshToken || req.body?.refreshToken;
        if (!token)
            throw new ApiError(401, "unauthorized access request");

        const decodedToken = Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        let user = await UserModel.findById(decodedToken._id).select("-password");

        if (!user || !user.refreshToken)
            throw new ApiError(401, "invalid token or session expired");

        const decodedRefreshToken = Jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET);

        if (decodedToken.iat !== decodedRefreshToken.iat)
            throw new ApiError(401, "session refreshed already");

        const { accessToken, refreshToken } = await generateTokens(user);

        user = await UserModel.findByIdAndUpdate(user._id, { active: true, lastActiveAt: new Date(), refreshToken }, { new: true }).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                user,
                accessToken,
                refreshToken
            }, "refreshToken successful"));
    } catch (error) {

        logger.info(error.stack);
        error = new ApiError(error?.statusCode || 401, error.message);
        res.status(error.statusCode).json(error);
    }

    logger.info('....generateRefreshToken ends....')
};