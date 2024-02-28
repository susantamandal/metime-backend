import express from 'express';

import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';
import { getPosts, createPost, updatePost, deletePost, getComments, createComment, updateComment, deleteComment} from '../controllers/post.controllers.js'
import { upload } from "../middlewares/multer.middlewares.js"

const router = express.Router();

router.get('/:uid/posts', verifyAccessToken, getPosts);
router.post('/post',  verifyAccessToken, upload.array('media', 10), createPost );
router.patch('/post', verifyAccessToken, upload.array('media', 10), updatePost );
router.delete('/post', verifyAccessToken, deletePost );

router.get('/:pid/comments', verifyAccessToken, getComments);
router.post('/comment',  verifyAccessToken, upload.single('media'), createComment );
router.patch('/comment',  verifyAccessToken, upload.single('media'), updateComment );
router.delete('/comment', verifyAccessToken, deleteComment );

export default router;