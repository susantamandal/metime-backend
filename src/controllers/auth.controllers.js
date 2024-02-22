import Jwt from 'jsonwebtoken'

import logger from '../logger/index.js';
import UserModel from "../models/user.models.js";
import { API_REQUEST, URL_AUTH } from '../utils/constants.utils.js'

const URL = URL_AUTH;

// ...............................Log In User.............................

export const login = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_AUTH}/login`);
    logger.info('....login starts....')

    try {
        logger.info(`login successful! ${req.body}`);
        let { email, googleId, password } = req.body
        logger.info(`login request: ${email}`)
        let user = await UserModel.findOne({ email })
        logger.info(`login successful! ${user}`);
        if (user && (user.googleId && user.googleId === googleId || user.password && user.password === password)) {
            UserModel.findByIdAndUpdate({ _id: user._id }, { active: true });
            let token = Jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET_KEY)
            res.cookie('metaserver-token', token, { httpOnly: false, maxAge: 10000 })
            logger.info(`login successful! ${user._id}`);
            res.status(200).json({ message: 'Login successful!', data: user })
        }
        else {
            logger.error('User unauthorized!')
            res.status(401).json({ message: 'User unauthorized!' })
        }

    } catch (error) {
        logger.error(error.message)
        res.status(404).json({ message: error.message })
    }
    logger.info('....login ends....')
}

// ...............................Log Out User.............................

export const logout = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_AUTH}/logout`);
    logger.info('....logout starts....')
    logger.info(`....logout user: ${req.params.id}`)
    try {
        UserModel.findByIdAndUpdate({ _id: req.params.id }, { active: false, lastActiveAt: new Date()});
        logger.info(`logout successful! ${req.params.id}`);
        res.status(200).json({ message: 'Logout successful!', data: null })
    } catch (error) {
        logger.error(error.message)
        res.status(404).json({ message: error.message });
    }
    logger.info('....logout ends....')
}

// ...............................Sign Up User.............................

export const signup = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_AUTH}/signup`);
    logger.info('....signup starts....')
    logger.info(`....signup request: ${req.body.email}`)
    try {

        let user = await UserModel.findOne({ email: req.body.email })

        if (user && req.body.password) {
            logger.error(`signup rejected!`)
            res.status(401).json({ message: `user already exists: ${user._id}` });
        }
        else if (!user) {
            user = new UserModel(req.body)
            await user.save()
            logger.info(`signup successful! ${user._id}`)
        }
        else
            logger.error(`user already exists: ${user._id}`)

        if (user && !user.googleId && req.body.googleId) {
            await UserModel.findByIdAndUpdate({ _id: user._id }, { googleId: req.body.googleId}, { new: true });
            logger.info(`user's googleId updated successfully!`)

        }
        await login(req, res)


    } catch (error) {
        logger.error(error.message)
        res.status(404).json({ message: error.message });
    }
    logger.info('....signup ends....')
}