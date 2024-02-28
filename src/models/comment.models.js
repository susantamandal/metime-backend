import mongoose from "mongoose";
import { destroyFromCloudinary } from "../utils/cloudinary.utils.js";
import logger from "../logger/index.js";

const commentSchema = mongoose.Schema({
    text: {
        type: String,
        maxLength: [100, "length cannot exceed 100 characters"],
        default: ""
    },
    media: {
        type: String,
        default: ""
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_comment",
        immutable: true,
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_post",
        immutable: true,
        required: [true, "value is required"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        immutable: true,
        required: [true, "value is required"]
    },
}, { timestamps: true });

commentSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const subComments = await CommentModel.find({ parent: this._id });
    for (let subComment of subComments) {
        await subComment.deleteOne();
    }
    if (this.media) {
        await destroyFromCloudinary(`comment-media-${this._id}`);
    }
    next();
});

const CommentModel = mongoose.model('metaserver_comment', commentSchema);

export default CommentModel;