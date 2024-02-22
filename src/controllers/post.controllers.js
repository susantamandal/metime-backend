import mongoose from "mongoose"

import logger from '../logger/index.js';
import UserModel from "../models/user.models.js";
import FriendModel from "../models/friend.models.js";
import PostModel from "../models/post.models.js";
import { URL_POST } from '../utils/constants.utils.js'

export const getPosts = async (req, res) => {

    logger.info(`getPosts starts!`)

    const creatorId = req.query.creatorId
    const postedTo = req.query.postedTo
    let limit = req.query.limit
    let offset = req.query.offset

    logger.info(creatorId, postedTo)
    let filters = []
    if(creatorId) filters.push({creatorId})
    if(postedTo) filters.push({postedTo})
    if(!offset) offset = 0
    if(!limit) limit = 5

    try{
        const posts = await PostModel.find(filters.length > 0 ? {$or: filters}: {}).sort({updatedAt:-1}).skip(offset).limit(limit).exec()
        const count = await PostModel.find(filters.length > 0 ? {$or: filters}: {}).count();
        logger.info(`getPosts successful!`)
        let body = {
            data: posts,
            total: count,
            offset: offset,
            limit: limit
        }
        res.status(200).json(body)
    }
    catch(error){
        res.status(404).json({ message: error.message })
    }
    logger.info(`getPosts ends!`)
}

export const createPost = async (req, res) => {
    logger.info(`createPost starts!`)
    try{
        const newPost = new PostModel(req.body)
        logger.info(`createPost payload!: ${req.body}`);
        await newPost.save();
        logger.info(`createPost successful! ${newPost._id}`);
        res.status(201).json(newPost);
    }
    catch(error){
        res.status(404).json({ message: error.message })
    }
    logger.info(`createPost ends!`)
}

export const deletePost = async (req, res) => {
    createPost(req, res)
}

export const updatePost = async (req, res) => {
    createPost(req, res)
}