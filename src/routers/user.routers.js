import express from "express";

import { getLoginUserAggregate, getUser, updateProfileAvatar, getUserRequests, getFriendRequests, sendFriendRequest, acceptFriendRequest, deleteFriendRequest, getFriends } from "../controllers/user.controllers.js";
import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';
import { upload } from "../middlewares/multer.middlewares.js"

const router = express.Router();

router.get('/loginuser', verifyAccessToken, getLoginUserAggregate);
router.get('/user/:id', verifyAccessToken, getUser);
router.patch('/avatar', verifyAccessToken, upload.single('avatar'), updateProfileAvatar);
router.delete('/avatar', verifyAccessToken, updateProfileAvatar);

router.get('/userrequests', verifyAccessToken, getUserRequests);
router.get('/friendrequests', verifyAccessToken, getFriendRequests);
router.post('/sendfriendrequest', verifyAccessToken, sendFriendRequest);
router.patch('/acceptfriendrequest/:rid', verifyAccessToken, acceptFriendRequest);
router.delete('/deletefriendrequest/:rid', verifyAccessToken, deleteFriendRequest);
router.get('/friends', verifyAccessToken, getFriends);

export default router;