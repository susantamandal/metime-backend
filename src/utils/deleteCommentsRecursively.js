import CommentModel from "../models/comment.models.js";
import { destroyFromCloudinary } from "./cloudinary.utils.js";

export const deleteCommentsRecursively = async (comment) => {

    const subComments = await CommentModel.find({parent: comment._id});

    for(const subComment of subComments){
        await deleteCommentsRecursively(subComment);
    }

    if (comment.media) {
        await destroyFromCloudinary(`comment-media-${comment._id}`);
    }

    await CommentModel.findByIdAndDelete(comment._id);
}