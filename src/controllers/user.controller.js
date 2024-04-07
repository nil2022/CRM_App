/**
 * Controllers for the user resources.
 * Only the user of type ADMIN should be able to perform the operations
 * defined in the User Controller
 */
import { User } from "../models/user.model.js";
import {
    errorLogger,
    infoLogger,
    sillyLogger,
    warningLogger,
} from "../utils/winstonLogger.js";

/**
 * * This controller fetches all users in database
 */
const fetchAll = async () => {
    try {
        const users = await User.find().select("-password -refreshToken -__v");
        // users.length = 0;

        infoLogger.info("fetched all users success");
        return users;
    } catch (err) {
        errorLogger.error(err);
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
        infoLogger.info("fetch by name success");
        return users;
    } catch (err) {
        errorLogger.error(
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

        infoLogger.info("fetch by usertype and userstatus success");
        return users;
    } catch (err) {
        errorLogger.error(
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
        infoLogger.info("fetch by usertype success");
        return users;
    } catch (err) {
        errorLogger.error(
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
        infoLogger.info("fetch by userstatus success");
        return users;
    } catch (err) {
        errorLogger.error(
            `Error while fetching users for userStatus [${userStatusReq}] `,
            err
        );
        throw err;
    }
};

/**
 * * Fetch the list of all users by different query params
 */
export const findAll = async (req, res) => {
    let users;
    const userTypeReq = req.query.userType
        ? req.query.userType.toUpperCase()
        : "";
    const userStatusReq = req.query.userStatus
        ? req.query.userStatus.toUpperCase()
        : "";
    const userNameReq = req.query.fullName;
    const userIdReq = req.query.userId;
    // sillyLogger.debug(
    //     `userTypeReq: ${userTypeReq} userStatusReq: ${userStatusReq} userNameReq: ${userNameReq} userIdReq: ${userIdReq} `
    // );
    try {
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
            warningLogger.warn("No users found in database ! (findall)");
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
    } catch (err) {
        // errorLogger.error(err);
        res.status(500).json({
            data: "",
            message: "Some internal error occured (findall)",
            statusCode: 500,
            success: false,
        });
    }
};

/**
 * * This controller fetch user by userId
 */
export const findByUserId = async (req, res) => {
    const userIdReq = req.query.userId.replace(/\s/g, "");
    try {
        const user = await User.findOne({
            userId: { $eq: userIdReq },
        }).select(" -password -refreshToken -__v");

        if (user.length === 0) {
            warningLogger.warn(` userId -> [${userIdReq}] not found in server`);
            return res.status(400).json({
                data: "",
                message: `User not found in server`,
                statusCode: 400,
                success: false,
            });
        }

        infoLogger.info("fetch user by userId success");

        return res.status(200).json({
            data: user,
            message: "User fetched successfully!",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        errorLogger.error(`Error fetching user data ::`, err);
        res.status(500).json({
            data: "",
            message: "Something went wrong",
            failure: 500,
            success: false,
        });
    }
};

/**
 * * This controller is to update userstatus
 * * i.e. PENDING -> APPROVED
 * * (This is to be updated only by MASTER(SYSTEM) ADMIN and other ADMINs)
 */
export const updateUserStatus = async (req, res) => {
    const { userStatus } = req.body;
    const userIdReq = req.query.userId.replace(/\s/g, "");
    try {
        const fetchedUser = await User.findOne({
            userId: { $eq: userIdReq },
        }).select(" -password -refreshToken ");

        const user = await User.findOneAndUpdate(
            {
                userId: { $eq: userIdReq },
            },
            {
                updatedAt: Date.now(),
                userStatus:
                    userStatus !== "" ? userStatus : fetchedUser.userStatus,
            },
            {
                new: true,
            }
        ).select(
            " -password -__v -refreshToken"
        );

        if (user.length === 0) {
            warningLogger.warn('User is not in server !!');
            return res.status(400).json({
                data: '',
                message: "User is not in server !!",
                statusCode: 400,
                success: false,
            });
        }
        infoLogger.info(`userId -> [${userIdReq}] data has been updated `);

        return res.status(200).json({
            data: user,
            message: "User record has been updated successfully",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        errorLogger.error(`Error while updating the record: ${err.message}`, err);
        res.status(500).json({
            data: '',
            message: "Something went wrong !",
            statusCode: 500,
            success: false,
        });
    }
};

// ? Make controllers for all users having features
// ? change password, email, avatar, etc. as per requirement


// ! This controller is to delete a user [USE by CAUTION !!]
/**
 * * This controller is to delete a user
 * * (This is to be DONE only by MASTER(SYSTEM) ADMIN and other ADMINs)
 */
export const deleteUser = async (req, res) => {
    const userIdReq = req.query.userId.replace(/\s/g, "");
    try {
        const user = await User.findOneAndDelete({ userId: userIdReq })
        .select(" -ticketsCreated -ticketsAssigned -password -__v");

        if (!user || user.length === 0) {
            warningLogger.warn(` userId -> [${userIdReq}] not found in server`);
            return res.status(400).json({
                data: "",
                message: `User not found in server`,
                statusCode: 400,
                success: false,
            });
        }
        infoLogger.info(`userId -> [${userIdReq}] data has been deleted !`);

        res.status(200).json({
            data: user,
            message: `User record has been deleted successfully`,
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        errorLogger.error(`Error while deleting the record for userId -> ${userIdReq}`, err);
        res.status(500).json({
            data: '',
            message: "Something went wrong !",
            statusCode: 500,
            success: false,
        });
    }
};
