import mongoose from "mongoose";

const friendSchema = mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        immutable: true,
        required: [true, "value is required"],
    },
    acceptorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        immutable: true,
        required: [true, "value is required"],
    },
    status:{
        type: String,
        enum: {
            values: ["Pending", "Accepted", "Blocked"],
            message: "value is not supported"
        },
        default: "Pending",
        required: [true, "value is required"],
    }
}, { timestamps: true } );

const FriendModel = mongoose.model('metaserver_friend', friendSchema);

export default FriendModel;