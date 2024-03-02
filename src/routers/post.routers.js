import express from 'express';

import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';
import { getPosts, createPost, updatePost, deletePost, getComments, createComment, updateComment, deleteComment, getLikes, createLike} from '../controllers/post.controllers.js'
import { upload } from "../middlewares/multer.middlewares.js"

const router = express.Router();

router.get('/:uid/posts', verifyAccessToken, getPosts);
router.post('/post',  verifyAccessToken, upload.array('media', 10), createPost );
router.patch('/post', verifyAccessToken, upload.array('media', 10), updatePost );
router.delete('/post/:pid', verifyAccessToken, deletePost );

router.get('/:pid/comments', verifyAccessToken, getComments);
router.post('/comment',  verifyAccessToken, upload.single('media'), createComment );
router.patch('/comment',  verifyAccessToken, upload.single('media'), updateComment );
router.delete('/comment/:cid', verifyAccessToken, deleteComment );

router.get('/:id/likes', verifyAccessToken, getLikes);
router.post('/like',  verifyAccessToken, createLike );
// router.delete('/unlike/:lid',  verifyAccessToken, deleteLike );

// router.get('/:pid/disLikes', verifyAccessToken, getLikes);
// router.post('/disLike',  verifyAccessToken, createLike );
// router.patch('/unDisLike/:lid',  verifyAccessToken, deleteLike );

export default router;