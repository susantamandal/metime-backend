import FriendModel from "../models/friend.models.js";
import { ACT_MESSAGE, ACT_UNFRIEND, ACT_BLOCK, ACT_DELETE_REQUEST, ACT_ADD_FRIEND, ACT_ACCEPT_REQUEST, ACT_UNBLOCK } from '../utils/constants.utils.js'

export const generateActionsOnUser = async (actionOn, actionBy) => {

    console.log(actionOn, actionBy);

    if (actionOn.equals(actionBy))
        return undefined;

    let friendRequest = await FriendModel.findOne({
        $or: [
            { requesterId: actionOn, acceptorId: actionBy },
            { requesterId: actionBy, acceptorId: actionOn }
        ]
    });

    let actions = [];

    if (!friendRequest)
        actions.push(ACT_ADD_FRIEND)

    if (friendRequest?.status.toLowerCase() === "pending" && friendRequest?.acceptorId === actionBy)
        actions.push(ACT_ACCEPT_REQUEST)

    if (friendRequest?.status.toLowerCase() === "pending")
        actions.push(ACT_DELETE_REQUEST)

    if (friendRequest?.status.toLowerCase() === "accepted") {
        actions.push(ACT_UNFRIEND)
        actions.push(ACT_MESSAGE)
    }

    if (friendRequest?.status.toLowerCase() === "blocked")
        actions.push(ACT_UNBLOCK)
    else
        actions.push(ACT_BLOCK)

    return actions;
}