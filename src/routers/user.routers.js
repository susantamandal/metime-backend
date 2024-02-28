import express from "express";

import { getLoginUser, getUser, updateProfileAvatar } from "../controllers/user.controllers.js";
import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';
import { upload } from "../middlewares/multer.middlewares.js"

const router = express.Router();
// router.post('/', createUser);
router.get('/loginuser', verifyAccessToken, getLoginUser);
router.get('/user', verifyAccessToken, getUser);
router.patch('/avatar', verifyAccessToken, upload.single('avatar'), updateProfileAvatar);
router.delete('/avatar', verifyAccessToken, updateProfileAvatar);
// router.get('/:id/friends', getFriends);
// router.get('/:uid/friend/:fid/actions', getActionsOnFriend);
// router.post('/:id/friendrequest', friendRequest);
// router.patch('/:id', updateUser);
// router.delete('/:id', deleteUser);

export default router;