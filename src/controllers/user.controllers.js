import logger from '../logger/index.js';
import UserModel from "../models/user.models.js";
import FriendModel from "../models/friend.models.js";
import {
    API_REQUEST, URL_USER, ACT_MESSAGE, ACT_UNFRIEND, ACT_BLOCK,
    ACT_DELETE_REQUEST, ACT_ADD_FRIEND, ACT_ACCEPT_REQUEST
} from '../utils/constants.utils.js'
import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { destroyFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { setUniqueProfileAvatarFileName } from "../utils/setUniqueFileNames.utils.js";



export const getActionsOnFriend = async (req, res) => {
    const { uid, fid } = req.params;

    logger.info(`${API_REQUEST} ${URL_USER}/${uid}/friend/${fid}/actions`);
    logger.info(`getActionsOnUser starts`);

    try {
        // const user = await UserModel.find({ _id: uid });
        // const friend = await UserModel.find({ _id: fid });
        const connection = await FriendModel.findOne({ $or: [{ requesterId: uid, accepterId: fid }, { requesterId: fid, accepterId: uid }] });
        let actions = []
        if (connection?.status === 'A') {
            actions = [...actions, ACT_MESSAGE, ACT_UNFRIEND, ACT_BLOCK]
        }
        else if (connection?.status === 'P') {
            actions = [...actions, ACT_DELETE_REQUEST, ACT_BLOCK]
        }
        else {
            actions = [...actions, ACT_ADD_FRIEND, ACT_BLOCK]
        }
        logger.info(`getActionsOnUser successful!`);
        res.status(200).json(actions);
    } catch (error) {
        logger.error(error.message);
        res.status(404).json({ message: error.message });
    }
    logger.info('getActionsOnUser ends')
}

export const getLoginUser = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getLogInUserDetails starts`);

    try {
        if (!req?.user)
            throw new ApiError(400, "user not found");

        res.status(200).json(new ApiResponse(200, req.user));

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getLogInUserDetails ends')
};

export const getUser = async (req, res) => {
    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`getUser starts`);

    try {

        const { id } = req.query;

        if (!id)
            throw new ApiError(400, "id is required to fetch user details");

        const user = await UserModel.findById(id).select("_id firstName lastName gender email accountDiabled active lastActiveAt profileAvatar");

        if (!user)
            throw new ApiError(400, `no user found with id ${_id}`);

        res.status(200).json(new ApiResponse(200, user));

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('getUser ends')
};

export const updateProfileAvatar = async (req, res) => {

    logger.info(`${API_REQUEST} ${URL_USER}`);
    logger.info(`updateProfileAvatar starts`);

    try {

        if (req.method === "DELETE") {

            if (!req.user.profileAvatar)
                throw new ApiError(400, "avatar not found");

            const response = await destroyFromCloudinary(`profile-avatar-${req.user._id}`);

            if (response.result === "ok") {
                await UserModel.findByIdAndUpdate(req.user._id, {
                    $unset:{
                        profileAvatar: 1
                    }
                });
                res.status(200).json(new ApiResponse(200, response, "avatar deleted successfully"));
            }
            else
                throw new ApiError(500, "error in deleting avatar");
        }
        else {

            const avatarLocalPath = await setUniqueProfileAvatarFileName(req);

            if (!avatarLocalPath)
                throw new ApiError(400, "avatar file is required");
            
            const avatar = await uploadOnCloudinary(avatarLocalPath);

            if (!avatar)
                throw new ApiError(500, "error in uploading avatar file");

            const user = await UserModel.findByIdAndUpdate(req.user._id, { profileAvatar: avatar.secure_url }, { new: true }).select("_id profileAvatar");

            res.status(200).json(new ApiResponse(200, user, "avatar uploaded successfully"));

        }

    } catch (error) {

        logger.info(error.stack)
        error = new ApiError(error?.statusCode || 400, error.message);
        res.status(error.statusCode).json(error);
    }
    logger.info('updateProfileAvatar ends')
}

// export const createUser = async (req, res) => {
//     logger.info(`${API_REQUEST} ${URL_USER}`);
//     logger.info(`createUser starts`);
//     const newUser = new UserModel(req.body);
//     try {
//         logger.info(`createUser payload!: ${req.body}`);
//         await newUser.save();
//         logger.info(`createUser successful! ${newUser._id}`);
//         res.status(201).json(newUser);
//     } catch (error) {
//         logger.error(error.message)
//         res.status(409).json({ message: error.message });
//     }
//     logger.info('createUser ends')
// }

// export const updateUser = async (req, res) => {
//     const { id: _id } = req.params;
//     const user = req.body;
//     logger.info(`${API_REQUEST} ${URL_USER}/${_id}`);
//     logger.info(`updateUser starts`);
//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//         logger.error(`No user with id ${_id} exist.`)
//         return res.status(404).send(`No user with id ${_id} exist.`);
//     }

//     try {
//         logger.info(`updateUser payload!: ${req.body}`);
//         const updatedUser = await UserModel.findByIdAndUpdate(_id, { ...user, _id }, { new: true });
//         logger.info(`updateUser successful! ${updatedUser._id}`);
//         res.status(202).json(updatedUser);
//     } catch (error) {
//         logger.error(error.message)
//         res.status(408).json({ message: error.message });
//     }
//     logger.info('updateUser ends')
// }

// export const deleteUser = async (req, res) => {
//     const { id: _id } = req.params;

//     logger.info(`${API_REQUEST} ${URL_USER}/${_id}`);
//     logger.info(`ndeleteUser starts`);
//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//         logger.error(`No user with id ${_id} exist.`)
//         return res.status(404).send(`No user with id ${_id} exist.`);
//     }
//     try {
//         logger.info(`deleteUser requested: ${_id}`);
//         await UserModel.findByIdAndRemove(_id);
//         logger.info(`deleteUser successful! ${_id}`);
//         res.status(204).json("User Deleted Successfully.");
//     } catch (error) {
//         logger.error(error.message);
//         res.status(408).json({ message: error.message });
//     }
//     logger.info('deleteUser ends');
// }

// export const getFriends = async (req, res) => {
//     const requesterId = req.params.id;
//     logger.info(`${API_REQUEST} ${URL_USER}/${requesterId}/friends`);
//     logger.info(`getFriends starts`);
//     if (!mongoose.Types.ObjectId.isValid(requesterId)) {
//         logger.error(`No user with id ${requesterId} exist.`)
//         return res.status(404).send(`No user with id ${requesterId} exist.`);
//     }
//     try {
//         let friends = await FriendModel.find({ $or: [{ requesterId: requesterId, status: 'A' }, { accepterId: requesterId, status: 'A' }] });

//         friends = friends.map(friend => mongoose.Types.ObjectId(
//             friend.requesterId === requesterId ? friend.accepterId : friend.requesterId
//         ));

//         friends = await UserModel.find({ '_id': { $in: friends } })

//         logger.info(`getFriends successful! ${friends.length}`);
//         res.status(200).json(friends);
//     } catch (error) {
//         logger.error(error.message);
//         res.status(408).json({ message: error.message });
//     }
//     logger.info('getFriends ends');
// }

// export const friendRequest = async (req, res) => {
//     const id = req.params.id
//     const { requesterId, accepterId, action } = req.body;
//     logger.info(`${API_REQUEST} ${URL_USER}/${id}/friendrequest`);
//     logger.info(`sendFriendRequest starts`);
//     if (!mongoose.Types.ObjectId.isValid(requesterId)) {
//         logger.error(`No user with id ${requesterId} exist.`)
//         return res.status(404).send(`No user with id ${rid} exist.`);
//     }
//     if (!mongoose.Types.ObjectId.isValid(accepterId)) {
//         logger.error(`No user with id ${accepterId} exist.`)
//         return res.status(404).send(`No user with id ${fid} exist.`);
//     }
//     try {
//         if (action === ACT_ADD_FRIEND) {
//             const newRequest = new UserModel(req.body);
//             await newRequest.save();
//             logger.info(`send friendrequest successful!`);
//             res.status(200).json({ message: 'Friend Request is sent successfully.' });
//         }
//         else if (action === ACT_ACCEPT_REQUEST) {
//             await FriendModel.findOneAndUpdate(
//                 { requesterId: requesterId, accepterId: accepterId },
//                 { status: 'A' }
//             );
//             logger.info(`accept friendrequest successful!`);
//             res.status(200).json({ message: 'Friend Request is accepted successfully.' });
//         }


//     } catch (error) {
//         logger.error(error.message);
//         res.status(408).json({ message: error.message });
//     }
//     logger.info('friendRequest ends');
// }




