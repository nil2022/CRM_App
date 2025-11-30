// controllers/user.controller.js
import User from "#models/user";
import mongoose from "mongoose";

/**
 * * Fetch the list of all users by different query params
 */
export const fetchAllUsers = async (query) => {
    const { userType, userStatus, fullName, page, limit } = query || {};

    // pagination defaults
    const pageNumber = page ? parseInt(page) : 1;
    const limitNumber = limit ? parseInt(limit) : 10;
    const skip = (pageNumber - 1) * limitNumber;

    // sanitize inputs
    const userTypeReq = userType ? userType.toString().toUpperCase().replace(/\n|\r/g, "").trim() : null;
    const userStatusReq = userStatus ? userStatus.toString().toUpperCase().replace(/\n|\r/g, "").trim() : null;
    const userNameReq = fullName ? fullName.toString().replace(/\n|\r/g, "").trim() : null;

    // build filter dynamically
    const filter = {};
    if (userTypeReq) filter.role = { $eq: userTypeReq };
    if (userStatusReq) filter.status = { $eq: userStatusReq };
    if (userNameReq) filter.fullName = { $regex: userNameReq, $options: "i" };

    // projection
    const projection = "-password -refreshToken -__v -refreshSessions";

    // parallel queries: count + paginated data
    const [count, users] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter).select(projection).skip(skip).limit(limitNumber),
    ]);

    if (!users || users.length === 0) {
        return {
            count: 0,
            data: [],
            message: "No users found in database !",
        };
    }

    return {
        count,
        data: users,
    };
};

/**
 * Fetch a user by userId (accepts either Mongo _id or a custom userId string).
 * Returns a plain JS object (lean).
 */
export const findByUserId = async (userId) => {
    // basic validation
    if (!userId || typeof userId !== "string") {
        throw { status: 400, message: "Invalid or missing userId" };
    }

    // sanitize
    const userIdReq = userId.replace(/\s/g, "");

    // determine filter: if valid ObjectId, search by _id; otherwise search by userId field
    const isObjectId = mongoose.Types.ObjectId.isValid(userIdReq);
    const filter = isObjectId ? { _id: userIdReq } : { userId: { $eq: userIdReq } };

    // projection: exclude sensitive/internal fields
    const projection = "-password -refreshToken -__v -refreshSessions";

    // use lean() for performance (returns plain JS object)
    const user = await User.findOne(filter).select(projection).lean();

    if (!user) {
        // 404 for not found — caller (controller) can map this to HTTP response
        console.info(`User not found for identifier: [${userIdReq}]`);
        throw { status: 404, message: "User not found" };
    }

    return user;
};

/**
 * * This controller is to update userstatus
 * * i.e. PENDING -> APPROVED
 * * (This is to be updated only by MASTER(SYSTEM) ADMIN and other ADMINs)
 */
export const updateUserStatus = async (payload) => {
    const { userId, status } = payload || {};
    // validate
    if (!userId || typeof userId !== "string") {
        throw { status: 400, message: "Invalid or missing userId" };
    }

    // sanitize
    const userIdReq = userId.replace(/\s/g, "");
    const statusReq = typeof status === "string" && status.trim() !== "" ? status.trim().toUpperCase() : null;

    // valid ObjectId?
    const isObjectId = mongoose.Types.ObjectId.isValid(userIdReq);
    const filter = isObjectId ? { _id: userIdReq } : { userId: { $eq: userIdReq } };

    // projection
    const projection = "-password -refreshToken -__v -refreshSessions";

    // fetch user first
    const existingUser = await User.findOne(filter).select(projection).lean();

    if (!existingUser) {
        console.info(`User not found for identifier: [${userIdReq}]`);
        throw { status: 404, message: "User not found" };
    }

    // if no status provided, keep existing
    const newStatus = statusReq || existingUser.status;

    const updated = await User.findOneAndUpdate(
        filter,
        {
            $set: {
                status: newStatus,
                updatedAt: Date.now(),
            },
        },
        {
            new: true,
            runValidators: true,
            context: "query",
        }
    )
        .select(projection)
        .lean();

    if (!updated) {
        throw { status: 500, message: "Failed to update user" };
    }

    return updated;
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
        const user = await User.findOneAndDelete({ userId: userIdReq }).select(
            " -ticketsCreated -ticketsAssigned -password -__v"
        );

        if (!user || user.length === 0) {
            // console.log(` userId -> [${userIdReq}] not found in server`);
            return res.status(400).json({
                data: "",
                message: `User not found in server`,
                statusCode: 400,
                success: false,
            });
        }
        // console.log(`userId -> [${userIdReq}] data has been deleted !`);

        res.status(200).json({
            data: user,
            message: `User record has been deleted successfully`,
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        // console.log(`Error while deleting the record for userId -> ${userIdReq}`, err);
        res.status(500).json({
            data: "",
            message: "Something went wrong !",
            statusCode: 500,
            success: false,
        });
    }
};
