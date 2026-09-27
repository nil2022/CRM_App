/**
 * Controllers for the user resources.
 * Only the user of type ADMIN should be able to perform the operations
 * defined in the User Controller
 */
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { BadRequestError } from "../utils/ApiError.js";
import { userStatus as userStatusValues } from "../utils/constants.js";

/**
 * * This controller fetches all users in database
 */
const fetchAll = async () => {
    try {
        const users = await User.find().select("-password -refreshToken -__v");
        // users.length = 0;

        // console.log("fetched all users success");
        return users;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

/**
 * * This controller fetch user by name
 */
const fetchByName = async (userNameReq) => {
    try {
        const users = await User.find({
            fullName: {
                $regex: userNameReq.replace(/\n|\r/g, ""),
                $options: "i",
            }, // $regex operator to find all documents in a collection, $options parameter to specify case-insensitivity
        }).select(" -password -refreshToken -__v ");
        // console.log("fetch by name success");
        return users;
    } catch (err) {
        console.log(
            `Error while fetching the user for Name : ${userNameReq.replace(/\n|\r/g, "")}`,
            err
        );
        throw err;
    }
};

/**
 * * This controller fetch user by usertype and userstatus
 */
const fetchByTypeAndStatus = async (userTypeReq, userStatusReq) => {
    try {
        const users = await User.find({
            userType: { $eq: userTypeReq },
            userStatus: { $eq: userStatusReq }, // $eq operator userStatusReq
        }).select(" -password -refreshToken -__v ");

        // console.log("fetch by usertype and userstatus success");
        return users;
    } catch (err) {
        console.log(
            `Error while fetching users for userType [${userTypeReq}] and userStatus [${userStatusReq}]`,
            err
        );
        throw err;
    }
};

/**
 * * This controller fetch user by usertype
 */
const fetchByType = async (userTypeReq) => {
    try {
        const users = await User.find({
            userType: { $eq: userTypeReq },
        });
        // console.log("fetch by usertype success");
        return users;
    } catch (err) {
        console.log(
            `Error while fetching users for userType [${userTypeReq}] `,
            err
        );
        throw err;
    }
};

/**
 * * This controller fetch user by userstatus
 */
const fetchByStatus = async (userStatusReq) => {
    try {
        const users = await User.find({
            userStatus: { $eq: userStatusReq },
        }).select(" -password -refreshToken -__v ");
        // console.log("fetch by userstatus success");
        return users;
    } catch (err) {
        console.log(
            `Error while fetching users for userStatus [${userStatusReq}] `,
            err
        );
        throw err;
    }
};

/**
 * * Fetch the list of all users by different query params
 */
export const findAll = asyncHandler(async (req, res) => {
    let users;
    const userTypeReq = req.query.userType
        ? req.query.userType.toUpperCase().replace(/\n|\r/g, "")
        : "";
    const userStatusReq = req.query.userStatus
        ? req.query.userStatus.toUpperCase().replace(/\n|\r/g, "")
        : "";
    const userNameReq = req.query.fullName;

    if (userNameReq) {
        users = await fetchByName(userNameReq);
    } else if (userTypeReq && userStatusReq) {
        users = await fetchByTypeAndStatus(userTypeReq, userStatusReq);
    } else if (userTypeReq) {
        users = await fetchByType(userTypeReq);
    } else if (userStatusReq) {
        users = await fetchByStatus(userStatusReq);
    } else {
        users = await fetchAll();
    }

    if (users.length === 0) {
        return res.status(200).json({
            data: "",
            message: "No users found in database !",
            statusCode: 200,
            success: true,
        });
    }
    res.status(200).json({
        data: users,
        message: "Users fetched successfully!",
        statusCode: 200,
        success: true,
    });
});

/**
 * * This controller fetch user by userId
 */
export const findByUserId = asyncHandler(async (req, res) => {
    const userIdReq = req.query.userId.replace(/\s/g, "");
    const user = await User.findOne({
        userId: { $eq: userIdReq },
    }).select(" -password -refreshToken -__v");

    if (user.length === 0) {
        console.log(` userId -> [${userIdReq}] not found in server`);
        throw new BadRequestError(`User not found in server`);
    }

    console.log("fetch user by userId success");

    return res.status(200).json({
        data: user,
        message: "User fetched successfully!",
        statusCode: 200,
        success: true,
    });
});

/**
 * * This controller is to update userstatus
 * * i.e. PENDING -> APPROVED
 * * (This is to be updated only by MASTER(SYSTEM) ADMIN and other ADMINs)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { userStatus } = req.body;
    // Resolve against the known allow-list instead of writing the client's
    // value straight into the update - the value that reaches the query
    // below always comes from `allowedStatuses`, never directly from req.body.
    const allowedStatuses = Object.values(userStatusValues);
    const matchedIndex = allowedStatuses.indexOf(userStatus);
    if (userStatus && matchedIndex === -1) {
        throw new BadRequestError("Invalid userStatus provided!");
    }

    const userIdReq = req.query.userId.replace(/\s/g, "");
    const fetchedUser = await User.findOne({
        userId: { $eq: userIdReq },
    }).select(" -password -refreshToken ");

    const nextUserStatus = matchedIndex !== -1 ? allowedStatuses[matchedIndex] : fetchedUser.userStatus;

    const user = await User.findOneAndUpdate(
        {
            userId: { $eq: userIdReq },
        },
        {
            updatedAt: Date.now(),
            userStatus: nextUserStatus,
        },
        {
            new: true,
        }
    ).select(
        " -password -__v -refreshToken"
    );

    if (user.length === 0) {
        throw new BadRequestError("User is not in server !!");
    }

    return res.status(200).json({
        data: user,
        message: "User record has been updated successfully",
        statusCode: 200,
        success: true,
    });
});

// ? Make controllers for all users having features
// ? change password, email, avatar, etc. as per requirement


// ! This controller is to delete a user [USE by CAUTION !!]
/**
 * * This controller is to delete a user
 * * (This is to be DONE only by MASTER(SYSTEM) ADMIN and other ADMINs)
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const userIdReq = req.query.userId.replace(/\s/g, "");
    const user = await User.findOneAndDelete({ userId: userIdReq })
        .select(" -ticketsCreated -ticketsAssigned -password -__v");

    if (!user || user.length === 0) {
        throw new BadRequestError(`User not found in server`);
    }

    res.status(200).json({
        data: user,
        message: `User record has been deleted successfully`,
        statusCode: 200,
        success: true,
    });
});
