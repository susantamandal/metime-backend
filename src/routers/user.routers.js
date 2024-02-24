import express from 'express';

import {createUser, updateUser, deleteUser,
    getFriends, getActionsOnFriend, friendRequest, getLoginUser, getUser} from '../controllers/user.controllers.js';
import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';

const router = express.Router();
router.post('/', createUser);
router.get('/loginuser', verifyAccessToken, getLoginUser);
router.get('/user', verifyAccessToken, getUser);
router.get('/:id/friends', getFriends);
router.get('/:uid/friend/:fid/actions', getActionsOnFriend);
router.post('/:id/friendrequest', friendRequest);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;