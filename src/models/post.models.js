import mongoose from "mongoose";

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
        required: true,
        default: 'public'
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
        type: [String],
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