import express from 'express';

import { getUser, createUser, updateUser, deleteUser,
    getFriends, getActionsOnFriend, friendRequest } from '../controllers/user.controllers.js';

const router = express.Router();
router.post('/', createUser);
router.get('/', getUser);
router.get('/:id/friends', getFriends);
router.get('/:uid/friend/:fid/actions', getActionsOnFriend);
router.post('/:id/friendrequest', friendRequest);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;