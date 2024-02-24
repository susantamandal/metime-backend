import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        maxLength: [50, 'length is required between [1,50]'],
        required: [true, "value is required"],
    },
    lastName: {
        type: String,
        trim: true,
        maxLength: [50, 'length is required between [1,50]'],
    },
    gender: {
        type: String,
        trim: true,
        enum: {
            values: ["Male", "Female", "Other"],
            message: 'value is not supported'
        },
        required: [true, "value is required"],
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        minLength: [5, 'lenth is required between [5,50]'],
        maxLength: [50, 'lenth is required between [5,50]'],
        lowercase: true,
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
            },
            message: props => `${props.value} is not a valid email, format should be /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/`
        },
        required: [true, "value is required"],
    },
    password: {
        type: String,
        trim: true,
        minLength: [5, 'lenth is required between [5,20]'],
        maxLength: [20, 'lenth is required between [5,20]'],
        required: [true, "value is required"],
    },
    phoneNo: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: props => `${props.value} is not a valid phone number, must be a valid 10 digit number`
        }
    },
    profileImageUrl: {
        type: String,
        trim: true
    },
    accountDisabled: {
        type: Boolean,
        default: false,
        required: [true, "value is required"],
    },
    active: {
        type: Boolean,
        default: false,
        required: [true, "value is required"],
    },
    lastActiveAt: {
        type: Date,
        default: new Date(),
        required: [true, "value is required"],
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function(){
    return Jwt.sign({
        _id: this._id,
        email: this.email,
        firstName: this.firstName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

userSchema.methods.generateRefreshToken = async function(){
    return Jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
};

const UserModel = mongoose.model('metaserver_user', userSchema);

export default UserModel;