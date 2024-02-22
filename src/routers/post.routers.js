import express from 'express';

import { getPosts, createPost, updatePost, deletePost } from '../controllers/post.controllers.js'

const router = express.Router();

router.get('/posts', getPosts);
router.get('/post/:id', getPosts);
router.post('/post', createPost );
router.put('/post/:id', updatePost );
router.delete('/post/:id', deletePost );

export default router;