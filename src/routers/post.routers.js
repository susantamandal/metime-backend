import express from 'express';

import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';
import { getPosts, createPost, updatePost, deletePost, getComments, createComment, updateComment, deleteComment, getLikesOrDisLikes, addLikeOrDisLike, removeLikeOrDisLike} from '../controllers/post.controllers.js'
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

router.get('/:id/likes', verifyAccessToken, getLikesOrDisLikes);
router.post('/like',  verifyAccessToken, addLikeOrDisLike );
router.delete('/unlike/:id',  verifyAccessToken, removeLikeOrDisLike );

router.get('/:id/dislikes', verifyAccessToken, getLikesOrDisLikes);
router.post('/dislike',  verifyAccessToken, addLikeOrDisLike );
router.delete('/undislike/:id',  verifyAccessToken, removeLikeOrDisLike );

export default router;