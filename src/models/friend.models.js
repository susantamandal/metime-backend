import mongoose from "mongoose";

const friendSchema = mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        required: true,
    },
    accepterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "metaserver_user",
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: 'P'
    }
}, { timestamps: true } );

const FriendModel = mongoose.model('metaserver_friend', friendSchema);

export default FriendModel;