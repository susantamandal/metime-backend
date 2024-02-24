import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    comment: {
        type: String,
        maxLength: [100, "length cannot exceed 100 characters"],
        required: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        required: true,
    },
    media:{
        type: Object
    }
}, { timestamps: true });


const postSchema = mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        required: true,
    },
    postedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        required: true,
    },
    type: {
        type: String,
    },
    status: {
        type: String
    },
    privacy: {
        type: String,
        enum: ["public", "private"],
        default: "public",
        required: true,
    },
    visibility: {
        type: Boolean,
        required: true,
        default: true
    },
    title: {
        type: String
    },
    quickInfo: {
        type: String
    },
    likes: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'metaserver_user'
            }
        ],
        default: []
    },
    comments: {
        type: [commentSchema],
        default: []
    },
    tags: {
        type: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'metaserver_user'
            }
        ],
        default: []
    },
    media: {
        type: [Object],
        default: []
    }
},{ timestamps: true });

const PostModel = mongoose.model('metaserver_post', postSchema);

export default PostModel;