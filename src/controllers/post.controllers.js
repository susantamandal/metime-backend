import mongoose from "mongoose"

import logger from '../logger/index.js';
import UserModel from "../models/user.models.js";
import PostModel from "../models/post.models.js";
import { API_REQUEST, URL_POST, GET_POST_DEFAULT_OFFSET, GET_POST_DEFAULT_LIMIT, GET_COMMENT_DEFAULT_LIMIT, GET_COMMENT_DEFAULT_OFFSET, GET_LIKE_DEFAULT_LIMIT, GET_LIKE_DEFAULT_OFFSET } from '../utils/constants.utils.js'
import { destroyFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { setUniquePostMediaFileNames, setUniqueCommentMediaFileName } from "../utils/setUniqueFileNames.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import CommentModel from "../models/comment.models.js";
import LikeModel from "../models/like.models.js";

export const getPosts = async (req, res) => {

    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`getPost starts!`)
    try {

        let { uid: _id } = req.params, { offset, limit } = req.query;

        offset = isNaN(offset) ? GET_POST_DEFAULT_OFFSET : parseInt(offset);
        limit = isNaN(limit) ? GET_POST_DEFAULT_LIMIT : parseInt(limit);

        if (!_id)
            throw new ApiError(400, "user id/_id is required to fetch posts");

        let user = (_id === req.user._id ? req.user : await UserModel.findById(_id));

        if (!user) {
            throw new ApiError(400, `user not found with id ${_id}`)
        }

        let postAggregate = await PostModel.aggregate([
            {
                $match: {
                    $or: [
                        { postedOn: user._id },
                        { createdBy: user._id }
                    ]
                }
            },
            {
                $facet: {
                    posts: [
                        { $sort: { createdAt: -1 } },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "metaserver_comments",
                                localField: "_id",
                                foreignField: "belongsTo",
                                as: "comments"
                            }
                        },
                        {
                            $addFields: {
                                totalComments: { $size: "$comments" }
                            }
                        },
                        {
                            $project: {
                                comments: 0,
                                __v: 0
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
                $addFields: {
                    pagination: { $arrayElemAt: ["$pagination", 0] },
                    user_id: user._id
                }
            }
        ]);


        res.status(200).json(new ApiResponse(200, postAggregate[0]));
    }
    catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`getPosts ends!`)

}

export const createPost = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`createPost starts!`)
    try {

        const { media, postedOn, ...rest } = req.body
        let post = await PostModel.create({ createdBy: req.user._id, postedOn, ...rest });
        req.post = post;
        const mediaLocalFilePaths = await setUniquePostMediaFileNames(req);
        let mediaCloudinaryUrls = [];
        for (let mediaLocalPath of mediaLocalFilePaths) {
            let mediaFromCloud = await uploadOnCloudinary(mediaLocalPath);
            mediaCloudinaryUrls.push(mediaFromCloud.secure_url);
        }
        post = await PostModel.findByIdAndUpdate(post._id, { media: mediaCloudinaryUrls }, { new: true }).select("-__v");
        res.status(201).json(new ApiResponse(201, post));
    }
    catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`createPost ends!`)
}

export const deletePost = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`deletePost starts!`)
    try {
        let { pid: _id } = req.params;
        if (!_id) {
            throw new ApiError(400, "post id/_id is required to delete");
        }
        const post = await PostModel.findOne({
            $and: [
                { _id },
                {
                    $or: [
                        { createdBy: req.user._id },
                        { postedOn: req.user._id }
                    ]
                }
            ]
        });
        if (!post) throw new ApiError(400, `no post found with id ${_id}`);
        await post.deleteOne();
        res.status(200).json(new ApiResponse(200, {}, "post deleted successfully"));
    }
    catch (error) {
        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`deletePost ends!`)
}

export const updatePost = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`updatePost starts!`)
    try {

        let { _id, id, media, ...rest } = req.body
        _id = _id ? _id : id;
        if (!_id) {
            throw new ApiError(400, "post id/_id is required to update");
        }

        let post = await PostModel.findByIdAndUpdate(_id, { ...rest }, { new: true });
        req.post = post;

        const mediaLocalFilePaths = await setUniquePostMediaFileNames(req);

        // delete existing media from cloudinary
        if (post.media.length > 0 && (mediaLocalFilePaths.length > 0 || media === "")) {
            for (let index = 0; index < post.media.length; index++) {
                await destroyFromCloudinary(`post-${post._id}-media-${index + 1}`);
            }
        }

        let mediaCloudinaryUrls = [];

        for (let mediaLocalPath of mediaLocalFilePaths) {
            let mediaFromCloud = await uploadOnCloudinary(mediaLocalPath);
            mediaCloudinaryUrls.push(mediaFromCloud.secure_url);
        }

        const updatePayload = (mediaCloudinaryUrls.length > 0 ? { media: mediaCloudinaryUrls } : (media === "" ? { media: [] } : {}));
        post = await PostModel.findByIdAndUpdate(_id, updatePayload, { new: true }).select("-__v");
        res.status(200).json(new ApiResponse(200, post));
    }
    catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`updatePost ends!`)
}

export const getComments = async (req, res) => {

    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`getComments starts!`)
    try {

        let { pid: _id } = req.params, { offset, limit, parent } = req.query;

        offset = isNaN(offset) ? GET_COMMENT_DEFAULT_OFFSET : parseInt(offset);
        limit = isNaN(limit) ? GET_COMMENT_DEFAULT_LIMIT : parseInt(limit);

        parent = parent || "000000000000000000000000";

        if (!_id)
            throw new ApiError(400, "post id/_id is required to fetch comments");

        let post = await PostModel.findById(_id);

        if (!post) {
            throw new ApiError(400, `no post found with id ${_id}`)
        }

        let comment = await CommentModel.findById(parent);

        if (parent !== "000000000000000000000000" && !comment) {
            throw new ApiError(400, `no parent comment found with id ${parent}`)
        }


        let commentAggregate = await CommentModel.aggregate([
            {
                $match: {
                    $and: [
                        { belongsTo: post._id },
                        { parent: mongoose.mongo.ObjectId(parent) }
                    ]
                }
            },
            {
                $facet: {
                    comments: [
                        { $sort: { createdAt: 1 } },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "metaserver_comments",
                                localField: "_id",
                                foreignField: "parent",
                                as: "subComments"
                            }
                        },
                        {
                            $addFields: {
                                totalSubComments: { $size: "$subComments" }
                            }
                        },
                        {
                            $project: {
                                subComments: 0,
                                __v: 0
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
                $addFields: {
                    pagination: { $arrayElemAt: ["$pagination", 0] },
                    post_id: _id
                }
            }
        ]);

        res.status(200).json(new ApiResponse(200, commentAggregate[0]));
    }
    catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`getComments ends!`)

}

export const createComment = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`createComment starts!`)
    try {

        let { media, parent, ...rest } = req.body

        if (!parent) {
            parent = mongoose.Types.ObjectId.createFromHexString("000000000000000000000000");
        }
        let comment = await CommentModel.create({ createdBy: req.user._id, parent, ...rest });
        comment.__v = undefined;
        req.comment = comment;

        const mediaLocalFilePath = await setUniqueCommentMediaFileName(req);

        if (mediaLocalFilePath) {
            const mediaFromCloud = await uploadOnCloudinary(mediaLocalFilePath);
            comment = await CommentModel.findByIdAndUpdate(comment._id, { media: mediaFromCloud.secure_url }, { new: true }).select("-__v");
        }

        res.status(201).json(new ApiResponse(201, comment));
    }
    catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`createComment ends!`)
}

export const updateComment = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`updateComment starts!`)
    try {

        let { _id, id, media, ...rest } = req.body
        if (!_id && !id) {
            throw new ApiError(400, "comment id/_id is required to update");
        }
        _id = _id ? _id : id;

        let comment = await CommentModel.findByIdAndUpdate(_id, { ...rest }, { new: true });
        req.comment = comment;

        const mediaLocalFilePath = await setUniqueCommentMediaFileName(req);

        // delete existing media from cloudinary
        if (comment.media && (mediaLocalFilePath || media === "")) {
            await destroyFromCloudinary(`comment-media-${comment._id}`);
        }

        let mediaFromCloud = {};

        if (mediaLocalFilePath) {
            mediaFromCloud = await uploadOnCloudinary(mediaLocalFilePath);
        }

        const updatePayload = (mediaFromCloud.secure_url ? { media: mediaFromCloud.secure_url } : (media === "" ? { media: "" } : {}));

        comment = await CommentModel.findByIdAndUpdate(_id, updatePayload, { new: true }).select("-__v");

        res.status(201).json(new ApiResponse(200, comment));
    }
    catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`updateComment ends!`)
}

export const deleteComment = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`deleteComment starts!`)
    try {
        let { cid: _id } = req.params;
        if (!_id) throw new ApiError(400, "comment id/_id is required to delete");
        const comment = await CommentModel.findById(_id);
        if (!comment) throw new ApiError(400, `no comment found with id ${_id}`);
        const post = await PostModel.findById(comment.belongsTo);
        if (!post) throw new ApiError(400, `no post found for the comment with id ${_id}`);
        if (!comment.createdBy.equals(req.user._id) && !post.createdBy.equals(req.user._id))
            throw new ApiError(400, `user cannot delete this comment`);
        await comment.deleteOne();
        res.status(200).json(new ApiResponse(200, {}, "comment deleted successfully"));
    }
    catch (error) {
        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`deleteComment ends!`)
}

export const getLikes = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`getLikes starts!`)
    try {
        let { id: _id } = req.params, { offset, limit } = req.query;

        offset = isNaN(offset) ? GET_LIKE_DEFAULT_OFFSET : parseInt(offset);
        limit = isNaN(limit) ? GET_LIKE_DEFAULT_LIMIT : parseInt(limit);

        if (!_id) throw new ApiError(400, `post or comment id/_id is required to fetch likes`);

        const like = await LikeModel.findOne({ like: true, postedTo: _id });

        if (!like)
            throw new ApiError(400, `no like available for the post/comment with id ${_id}`);

        const doc = (like.type === "Comment" ? await CommentModel.findById(_id) : await PostModel.findById(_id));

        if (!doc) throw new ApiError(400, `no ${like.type.toLowercase()} found with id ${_id}`);

        const likesAggregate = await LikeModel.aggregate([
            {
                $match: {
                    like: true,
                    postedTo: doc._id
                }
            },
            {

                $facet: {
                    likes: [
                        { $sort: { createdAt: 1 } },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "metaserver_users",
                                localField: "createdBy",
                                foreignField: "_id",
                                as: "likedBy",
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
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                    pagination: [
                        { $count: 'total' },
                        {
                            $addFields: {
                                offset: offset,
                                limit: { $cond: [{ $lt: ["$total", limit] }, "$total", limit] }
                            }
                        }

                    ]
                }

            },
            {
                $set: {
                    likes: {
                        $map: {
                            input: "$likes",
                            as: "like",
                            in: {
                                $mergeObjects: [
                                    { $first: "$$like.likedBy" },
                                    { like_id: "$$like._id", like_type: "$$like.type" }
                                ]
                            }
                        }
                    },
                    pagination: { $first: "$pagination" },
                    post_id: _id
                }
            }
        ]);

        res.status(200).json(new ApiResponse(200, likesAggregate[0]));
    }
    catch (error) {
        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`getLikes ends!`)
}

export const createLike = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_POST}`);
    logger.info(`createLike starts!`)
    try {
        let { type, postedTo } = req.body;
        if (!type || !postedTo) throw new ApiError(400, "type and postedTo id are required to post a like");
        const doc = (type === "Comment" ? await CommentModel.findById(postedTo) : await PostModel.findById(postedTo));
        if (!doc) throw new ApiError(400, `no ${type.toLowercase()} found with id ${postedTo}`);

        let like = await LikeModel.findOne({ postedTo, createdBy: req.user._id });

        if (like)
            like = await LikeModel.findByIdAndUpdate(like._id, { like: true }, { new: true });
        else
            like = await LikeModel.create({ type, postedTo, createdBy: req.user._id });

        like.__v = undefined;
        res.status(201).json(new ApiResponse(201, like));
    }
    catch (error) {
        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info(`createLike ends!`)
}