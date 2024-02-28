import mongoose, { Model } from "mongoose";
import circularJSON from  "circular-json"
import { destroyFromCloudinary } from "../utils/cloudinary.utils.js";
import CommentModel from "./comment.models.js";

const postSchema = mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        required: [true, "value is required"],
        immutable: true
    },
    postedOn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        required: [true, "value is required"],
        immutable: true
    },
    type: {
        type: String,
    },
    status: {
        type: String
    },
    privacy: {
        type: String,
        enum: {
            values: ["public", "private"],
            message: 'value is not supported'
        },
        default: "public"
    },
    visibility: {
        type: Boolean,
        default: true,
        required: [true, "value is required"],
    },
    caption: {
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
        type: [String],
        default: []
    }
},{ timestamps: true });

postSchema.pre('deleteOne', { document: true, query: false }, async function(next){
    const comments = await CommentModel.find({belongsTo: this._id, parent: "000000000000000000000000"});
    for(let comment of comments){
        await comment.deleteOne();
    }
    if (this.media.length > 0) {
        for (let index = 0; index < this.media.length; index++) {
            await destroyFromCloudinary(`post-${this._id}-media-${index + 1}`);
        }
    }
    next();
})

const PostModel = mongoose.model('metaserver_post', postSchema);

export default PostModel;