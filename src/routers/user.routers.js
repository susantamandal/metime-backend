import express from "express";

import { getLoginUserAggregate, getUser, updateProfileAvatar, updateCoverPhoto, getUserRequests, getFriendRequests, sendFriendRequest, acceptFriendRequest, deleteFriendRequest, getFriends, getActionsOnUser } from "../controllers/user.controllers.js";
import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';
import { upload } from "../middlewares/multer.middlewares.js"

const router = express.Router();

router.get('/loginuser', verifyAccessToken, getLoginUserAggregate);
router.get('/user/:id', verifyAccessToken, getUser);
router.patch('/avatar', verifyAccessToken, upload.single('avatar'), updateProfileAvatar);
router.delete('/avatar', verifyAccessToken, updateProfileAvatar);
router.patch('/coverphoto', verifyAccessToken, upload.single('coverPhoto'), updateCoverPhoto);
router.delete('/coverphoto', verifyAccessToken, updateCoverPhoto);

router.get('/userrequests', verifyAccessToken, getUserRequests);
router.get('/friendrequests', verifyAccessToken, getFriendRequests);
router.post('/sendfriendrequest', verifyAccessToken, sendFriendRequest);
router.patch('/acceptfriendrequest/:rid', verifyAccessToken, acceptFriendRequest);
router.delete('/deletefriendrequest/:rid', verifyAccessToken, deleteFriendRequest);
router.get('/:uid/friends', verifyAccessToken, getFriends);

router.get('/:uid/actions', verifyAccessToken, getActionsOnUser);


export default router;