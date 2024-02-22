import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routers/auth.routers.js";
import userRouter from "./routers/user.routers.js";
import postRouter from "./routers/post.routers.js";
import { URL_AUTH, URL_USER, URL_POST } from "./utils/constants.utils.js"

const server = express();
server.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
server.use(express.json({ limit: '30kb', extended: true }));
server.use(express.urlencoded({ limit: '30kb', extended: true }));
server.use(express.static("public"));
server.use(cookieParser());

server.use(URL_AUTH, authRouter)
server.use(URL_USER, userRouter)
server.use(URL_POST, postRouter)

export { server };