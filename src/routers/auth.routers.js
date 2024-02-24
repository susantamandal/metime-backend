import express from 'express';

import { login, signup, logout, generateRefreshToken } from '../controllers/auth.controllers.js'
import { verifyAccessToken } from '../middlewares/apigateway.middlewares.js';


const router = express.Router();
router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', verifyAccessToken, logout);
router.post('/refreshtoken', generateRefreshToken);
export default router;