import logger from '../logger/index.js';
import UserModel from "../models/user.models.js";
import FriendModel from "../models/friend.models.js";
import { API_REQUEST, URL_USER, GET_FR_DEFAULT_OFFSET, GET_FR_DEFAULT_LIMIT } from '../utils/constants.utils.js'
import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { destroyFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { setUniqueProfileAvatarFileName, setUniqueCoverPhotoFileName } from "../utils/setUniqueFileNames.utils.js";
import mongoose from 'mongoose';
import { generateActionsOnUser } from '../utils/generateActions.utils.js';


export const getActionsOnUser = async (req, res) => {

    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getActionsOnUser starts`);

    try {

        const { uid } = req.params;

        let user = await UserModel.findById(uid);

        if (!user)
            throw new ApiError(400, `user not found with id ${uid}`);

        const actions = await generateActionsOnUser(uid, req.user._id);
        res.status(200).json({
            actionOn: uid,
            actionBy: req.user._id,
            actions: actions
        });

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getActionsOnUser ends')
}

export const getLoginUserAggregate = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getLogInUserDetails starts`);

    try {
        if (!req?.user)
            throw new ApiError(400, "user not found");

        const loginUserAggregate = await UserModel.aggregate([
            {
                $match: { _id: req.user._id }
            },
            {
                $lookup: {
                    from: "metaserver_posts",
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { createdBy: req.user._id },
                                    { postedOn: req.user._id }
                                ]
                            }
                        }
                    ],
                    as: "posts",
                }
            },
            {
                $lookup: {
                    from: "metaserver_friends",
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { status: "Accepted" },
                                    {
                                        $or: [
                                            { requesterId: req.user._id },
                                            { acceptorId: req.user._id }
                                        ]
                                    }
                                ]
                            }
                        }
                    ],
                    as: "friends",
                }
            },
            {
                $addFields: {
                    totalPosts: { $size: "$posts" },
                    totalFriends: { $size: "$friends" },
                }
            },
            {
                $project: {
                    posts: 0,
                    friends: 0,
                    password: 0,
                    refreshToken: 0,
                    __v: 0
                }
            }
        ]);

        res.status(200).json(new ApiResponse(200, loginUserAggregate[0]));

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getLogInUserDetails ends')
};

export const getUser = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getUser starts`);

    try {

        const { id: _id } = req.params;

        if (!_id)
            throw new ApiError(400, "id is required to fetch user details");

        const user = await UserModel.findById(_id).select("_id firstName lastName gender email accountDiabled active lastActiveAt profileAvatar");

        if (!user)
            throw new ApiError(400, `no user found with id ${_id}`);

        res.status(200).json(new ApiResponse(200, user));

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getUser ends')
};

export const updateProfileAvatar = async (req, res) => {

    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`updateProfileAvatar starts`);

    try {

        if (req.method === "DELETE") {

            if (!req.user.profileAvatar)
                throw new ApiError(400, "avatar not found");

            const response = await destroyFromCloudinary(`profile-avatar-${req.user._id}`);

            if (response.result === "ok") {
                await UserModel.findByIdAndUpdate(req.user._id, {
                    $unset: {
                        profileAvatar: 1
                    }
                });
                res.status(200).json(new ApiResponse(200, response, "avatar deleted successfully"));
            }
            else
                throw new ApiError(500, "error in deleting avatar");
        }
        else {

            const avatarLocalPath = await setUniqueProfileAvatarFileName(req);

            if (!avatarLocalPath)
                throw new ApiError(400, "avatar file is required");

            const avatar = await uploadOnCloudinary(avatarLocalPath);

            if (!avatar)
                throw new ApiError(500, "error in uploading avatar file");

            const user = await UserModel.findByIdAndUpdate(req.user._id, { profileAvatar: avatar.secure_url }, { new: true }).select("-password -refreshToken -__v");

            res.status(200).json(new ApiResponse(200, user, "avatar uploaded successfully"));

        }

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('updateProfileAvatar ends')
}

export const updateCoverPhoto = async (req, res) => {

    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`updateCoverPhoto starts`);

    try {

        if (req.method === "DELETE") {

            if (!req.user.coverPhoto) throw new ApiError(400, "cover photo not found");
            const response = await destroyFromCloudinary(`cover-photo-${req.user._id}`);
            if (response.result === "ok") {
                await UserModel.findByIdAndUpdate(req.user._id, {
                    $unset: {
                        coverPhoto: 1
                    }
                });
                res.status(200).json(new ApiResponse(200, response, "cover photo deleted successfully"));
            }
            else
                throw new ApiError(500, "error in deleting coverPhoto");
        }
        else {

            const coverPhotoLocalPath = await setUniqueCoverPhotoFileName(req);

            if (!coverPhotoLocalPath)
                throw new ApiError(400, "cover photo file is required");

            const coverPhoto = await uploadOnCloudinary(coverPhotoLocalPath);

            if (!coverPhoto)
                throw new ApiError(500, "error in uploading coverPhoto file");

            const user = await UserModel.findByIdAndUpdate(req.user._id, { coverPhoto: coverPhoto.secure_url }, { new: true }).select("-password -refreshToken -__v");

            res.status(200).json(new ApiResponse(200, user, "coverPhoto uploaded successfully"));

        }

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('updateCoverPhoto ends')
}


export const getUserRequests = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getUserRequests starts`);

    try {

        let { offset, limit } = req.query
        offset = isNaN(offset) ? GET_FR_DEFAULT_OFFSET : parseInt(offset);
        limit = isNaN(limit) ? GET_FR_DEFAULT_LIMIT : parseInt(limit);

        let userRequestAggregate = await FriendModel.aggregate([
            {
                $match: { requesterId: req.user._id, status: "Pending" }
            },
            {
                $facet: {
                    requests: [
                        { $sort: { createdAt: 1 } },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "metaserver_users",
                                localField: "acceptorId",
                                foreignField: "_id",
                                as: "requestTo",
                                pipeline: [
                                    {
                                        $project: {
                                            _id: 1,
                                            firstName: 1,
                                            lastName: 1,
                                            gender: 1,
                                            email: 1,
                                            active: 1,
                                            profileAvatar: 1,
                                            coverPhoto: 1
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                    pagination: [
                        { $count: "total" },
                        {
                            $addFields: {
                                offset: offset,
                                limit: {
                                    $cond: [{ $lt: ["$total", limit] }, "$total", limit]
                                }
                            }
                        }
                    ]
                }
            },
            {

                $set: {
                    requests: {
                        $map: {
                            input: "$requests",
                            as: "request",
                            in: {
                                $mergeObjects: [
                                    { $first: "$$request.requestTo" },
                                    { friendRequest_id: "$$request._id", friendRequest_status: "$$request.status" }
                                ]
                            }
                        }
                    },
                    pagination: { $arrayElemAt: ["$pagination", 0] },
                    user_id: req.user._id
                }
            }
        ]);
        for (let friend of friendsAggregate[0].friends) {
            friend.actions = await generateActionsOnUser(friend._id, req.user._id)
        }

        res.status(200).json(new ApiResponse(200, userRequestAggregate[0]));
    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getUserRequests ends')
}

export const getFriendRequests = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getFriendRequests starts`);

    try {
        let { offset, limit } = req.query
        offset = isNaN(offset) ? GET_FR_DEFAULT_OFFSET : parseInt(offset);
        limit = isNaN(limit) ? GET_FR_DEFAULT_LIMIT : parseInt(limit);

        let friendRequestAggregate = await FriendModel.aggregate([
            {
                $match: { acceptorId: req.user._id, status: "Pending" }
            },
            {
                $facet: {
                    requests: [
                        { $sort: { createdAt: 1 } },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "metaserver_users",
                                localField: "requesterId",
                                foreignField: "_id",
                                as: "requestFrom",
                                pipeline: [
                                    {
                                        $project: {
                                            _id: 1,
                                            firstName: 1,
                                            lastName: 1,
                                            gender: 1,
                                            email: 1,
                                            active: 1,
                                            profileAvatar: 1,
                                            coverPhoto: 1
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                    pagination: [
                        { $count: "total" },
                        {
                            $addFields: {
                                offset: offset,
                                limit: {
                                    $cond: [{ $lt: ["$total", limit] }, "$total", limit]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $set: {
                    requests: {
                        $map: {
                            input: "$requests",
                            as: "request",
                            in: {
                                $mergeObjects: [
                                    { $first: "$$request.requestFrom" },
                                    { friendRequest_id: "$$request._id", friendRequest_status: "$$request.status" }
                                ]
                            }
                        }
                    },
                    pagination: { $arrayElemAt: ["$pagination", 0] },
                    user_id: req.user._id
                }
            }
        ]);

        for (let friend of friendRequestAggregate[0].request) {
            friend.actions = await generateActionsOnUser(friend._id, req.user._id)
        }

        res.status(200).json(new ApiResponse(200, friendRequestAggregate[0]));
    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getFriendRequests ends')
}

export const sendFriendRequest = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`sendFriendRequest starts`);

    try {
        const { requestTo } = req.body;
        if (!requestTo) throw new ApiError(400, "requestTo id is required to send a request");
        if (requestTo === req.user._id.toString()) throw new ApiError(400, "friend request cannot be sent to same user");
        const requestToUser = await UserModel.findById(requestTo);
        if (!requestToUser) throw new ApiError(400, `no user found with id ${requestTo}`);
        let friendRequest = await FriendModel.findOne({
            $or: [
                { requesterId: req.user._id, acceptorId: requestTo },
                { requesterId: requestTo, acceptorId: req.user._id },
            ]
        }).select("-__v");

        if (friendRequest) {
            res.status(200).json(new ApiResponse(200, friendRequest, `you are already in ${friendRequest.status} state`));
        }
        else {
            friendRequest = await FriendModel.create({ requesterId: req.user._id, acceptorId: requestTo });
            friendRequest.__v = undefined;
            res.status(201).json(new ApiResponse(201, friendRequest, "friend request sent successfully"));
        }

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('sendFriendRequest ends')
}

export const acceptFriendRequest = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`acceptFriendRequest starts`);

    try {
        const { rid: _id } = req.params;
        let friendRequest = await FriendModel.findById(_id).select("-__v");
        if (!friendRequest) throw new ApiError(400, `no request found with id ${_id}`);
        if (!friendRequest.acceptorId.equals(req.user._id))
            throw new ApiError(400, `user cannot accept the request`);
        if (friendRequest.status === "Pending")
            friendRequest = await FriendModel.findByIdAndUpdate(_id, { status: "Accepted" }, { new: true }).select("-__v");
        res.status(200).json(new ApiResponse(200, friendRequest));
    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('acceptFriendRequest ends')
}

export const deleteFriendRequest = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`deleteFriendRequest starts`);

    try {
        const { rid: _id } = req.params;
        let friendRequest = await FriendModel.findById(_id).select("-__v");
        if (!friendRequest) throw new ApiError(400, `no request found with id ${_id}`);
        if (!friendRequest.acceptorId.equals(req.user._id) && !friendRequest.requesterId.equals(req.user._id))
            throw new ApiError(400, `user cannot accept the request`);
        await FriendModel.findByIdAndDelete(_id);
        res.status(200).json(new ApiResponse(200, {}, "request deleted successfully"));
    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('deleteFriendRequest ends')
}

export const getFriends = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getFriends starts`);

    try {
        let { uid: user_id } = req.params, { offset, limit } = req.query;
        user_id = new mongoose.Types.ObjectId(user_id);
        offset = isNaN(offset) ? GET_FR_DEFAULT_OFFSET : parseInt(offset);
        limit = isNaN(limit) ? GET_FR_DEFAULT_LIMIT : parseInt(limit);

        let friendsAggregate = await FriendModel.aggregate([
            {
                $match: {
                    $and: [
                        { status: "Accepted" },
                        {
                            $or: [
                                { acceptorId: user_id },
                                { requesterId: user_id }
                            ]
                        }
                    ]
                }
            },
            {
                $facet: {
                    friends: [
                        { $sort: { updatedAt: -1 } },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "metaserver_users",
                                let: {
                                    requester_id: "$requesterId",
                                    acceptor_id: "$acceptorId"
                                },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $ne: ["$_id", user_id] },
                                                    {
                                                        $or: [
                                                            { $eq: ["$_id", "$$requester_id"] },
                                                            { $eq: ["$_id", "$$acceptor_id"] }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            firstName: 1,
                                            lastName: 1,
                                            gender: 1,
                                            email: 1,
                                            active: 1,
                                            profileAvatar: 1,
                                            coverPhoto: 1
                                        }
                                    }

                                ],
                                as: "friend"
                            }
                        }
                    ],
                    pagination: [
                        { $count: "total" },
                        {
                            $addFields: {
                                offset: offset,
                                limit: {
                                    $cond: [{ $lt: ["$total", limit] }, "$total", limit]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $set: {
                    friends: {
                        $map: {
                            input: "$friends",
                            as: "friendRequest",
                            in: {
                                $mergeObjects: [
                                    { $first: "$$friendRequest.friend" },
                                    { friendRequest_id: "$$friendRequest._id", friendRequest_status: "$$friendRequest.status" }
                                ]
                            }
                        }
                    },
                    pagination: { $arrayElemAt: ["$pagination", 0] },
                    user_id
                }
            }
        ]);

        for (let friend of friendsAggregate[0].friends) {
            friend.actions = await generateActionsOnUser(friend._id, req.user._id)
        }

        res.status(200).json(new ApiResponse(200, friendsAggregate[0]));
    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getFriends ends')
}

