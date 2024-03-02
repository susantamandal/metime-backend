import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    like: {
        type: Boolean,
        required: [true, "value is required"],
    },
    type:{
        type: String,
        enum: {
            values: ["Post", "Comment"],
            message: 'value is not supported'
        },
        required: [true, "value is required"],
    },
    postedTo: {
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

const LikeModel = mongoose.model('metaserver_like', likeSchema);

export default LikeModel;