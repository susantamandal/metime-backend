import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    gender: {
        type: String
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String
    },
    googleId: {
        type: String
    },
    mobileNo: {
        type: Number
    },
    imageUrl: {
        type: String
    },
    accountDisabled:{
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    lastActiveAt: {
        type: Date,
        default: new Date()
    }
},{ timestamps: true });

const UserModel = mongoose.model('metaserver_user', userSchema);

export default UserModel;