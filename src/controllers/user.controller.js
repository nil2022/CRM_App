/**
 * Controllers for the user resources.
 * Only the user of type ADMIN should be able to perform the operations
 * defined in the User Controller
 */
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
// const ObjectConverter = require('../utils/objectConverter')

export const fetchAll = async (res) => {
    let users;
    try {
        users = await User.find().select(
            "-password -createdAt -updatedAt -refreshToken -ticketsCreated -ticketsAssigned -__v"
        );
    } catch (err) {
        console.log("Error while fetching the users");
        res.status(500).json({
            data: {},
            message: "Some internal error occured",
            statusCode: 400,
            success: false,
        });
    }
    return users;
};

export const fetchByName = async (userNameReq, res) => {
    let users;
    try {
        users = await User.find({
            name: { $regex: userNameReq.replace(/\n|\r/g, ""), $options: "i" }, // $regex operator to find all documents in a collection, $options parameter to specify case-insensitivity
        });
    } catch (err) {
        console.log(
            "Error while fetching the user for Name : ",
            userNameReq.replace(/\n|\r/g, "")
        );
        res.status(500).json({
            data: {},
            message: "Some internal error occured",
            statusCode: 400,
            success: false,
        });
    }
    return users;
};

export const fetchByTypeAndStatus = async (userTypeReq, userStatusReq, res) => {
    let users;
    try {
        users = await User.find({
            userType: { $eq: userTypeReq },
            userStatus: { $eq: userStatusReq }, // $eq operator userStatusReq
        });
    } catch (err) {
        console.err(
            `error while fetching the user for userType [${userTypeReq}] and userStatus [${userStatusReq}]`
        );
        res.status(500).json({
            data: {},
            message: "Some internal error occured",
            statusCode: 400,
            success: false,
        });
    }
    return users;
};

export const fetchByType = async (userTypeReq, res) => {
    let users;
    try {
        users = await User.find({
            userType: { $eq: userTypeReq },
        });
    } catch (err) {
        console.err(
            `error while fetching the user for userType [${userTypeReq}] `
        );
        res.status(500).json({
            data: {},
            message: "Some internal error occured",
            statusCode: 400,
            success: false,
        });
    }
    return users;
};

export const fetchByStatus = async (userStatusReq, res) => {
    let users;
    try {
        users = await User.find({
            userStatus: { $eq: userStatusReq },
        });
    } catch (err) {
        console.err(
            `error while fetching the user for userStatus [${userStatusReq}] `
        );
        res.status(500).json({
            data: {},
            message: "Some internal error occured",
            statusCode: 400,
            success: false,
        });
    }
    return users;
};
/**
 * Fetch the list of all users
 */
export const findAll = async (req, res) => {
    let users;
    const userTypeReq = req.query.userType;
    const userStatusReq = req.query.userStatus;
    const userNameReq = req.query.name;
    try {
        if (userNameReq) {
            users = await fetchByName(userNameReq, res);
        } else if (userTypeReq && userStatusReq) {
            users = await fetchByTypeAndStatus(userTypeReq, userStatusReq, res);
        } else if (userTypeReq) {
            users = await fetchByType(userTypeReq, res);
        } else if (userStatusReq) {
            users = await fetchByStatus(userStatusReq, res);
        } else {
            users = await fetchAll(res);
        }
        if (users.length === 0) {
            console.log(
                "users is null in 'exports.findAll' in 'user.controller.js', check if [name] is entered correctly"
            );
            throw new Error();
        }
        res.status(200).json({
            data: users,
            message: "Users fetched successfully!",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            data: {},
            message: "Some internal error occured",
            statusCode: 400,
            success: false,
        });
    }
};

export const findById = async (req, res) => {
    const userIdReq = req.query.userId;
    try {
        const user = await User.findOne({
            userId: { $eq: userIdReq },
        }).select(" -password -ticketsCreated -ticketsAssigned -refreshToken");
        if (user.length === 0) {
            throw new Error();
        }
        res.status(200).json({
            data: user,
            message: "User fetched successfully!",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        console.error("userId not found by exports.findById method");
        res.status(500).json({
          data: {},
          message: `User with this id [${userIdReq}] not found`,
          statusCode: 400,
          success: false,
      });
    }
};

export const update = async (req, res) => {
    const { name, email, userStatus, isEmailVerified } = req.body;
    // if (
    //     typeof name !== "string" ||
    //     typeof email !== "string" ||
    //     typeof userStatus !== "string"
    // ) {
    //     console.log(
    //         "Invalid data type, check either name, email or userStatus is missing or not"
    //     );
    //     return res.status(400).send({
    //         message:
    //             "either [name], [email] or [userStatus] is missing",
    //     });
    // }
    const userIdReq = req.query.userId;
    try {
        const fetchedUser = await User.findOne({
            userId: { $eq: userIdReq },
        }).select(" -ticketsCreated -ticketsAssigned -refreshToken ");

        console.log("userstatus:", userStatus);
        const user = await User.findOneAndUpdate(
            {
                userId: { $eq: userIdReq },
            },
            {
                name: name !== "" ? name : fetchedUser.name,
                email: email !== "" ? email : fetchedUser.email,
                isEmailVerified:
                    isEmailVerified !== ""
                        ? isEmailVerified
                        : fetchedUser.isEmailVerified,
                updatedAt: Date.now(),
                userStatus:
                    userStatus === ""
                        ? userStatus.toUpperCase()
                        : fetchedUser.userStatus,
            },
            {
                new: true,
            }
        ).select(
            " -ticketsCreated -ticketsAssigned -password -__v -refreshToken"
        );

        if (user === null) {
            console.log("user is not in DB !!");
            return res.status(400).json({
                data: {},
                message: "User is not in server !!",
                statusCode: 400,
                success: false,
            });
        }
        return res.status(200).json({
            data: user,
            message: "User record has been updated successfully",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        console.log("Error while updating the record:", err.message);
        res.status(500).json({
            data: {},
            message: "Something went wrong !",
            statusCode: 500,
            success: false,
        });
    }
};

// Code added my me - START
export const deleteUser = async (req, res) => {
    const userIdReq = req.query.userId.replace(/\s/g, "");
    try {
        const user = await User.findOneAndDelete({ userId: userIdReq }).select(
            " -updatedAt -ticketsCreated -ticketsAssigned -password -__v"
        );
        if (user === null) {
            console.log("user is not in DB !!");
            return res.status(400).json({
                data: {},
                message: "User is not in server !!",
                statusCode: 400,
                success: false,
            });
        }
        console.log("Request received to delete user for", user);
        res.status(200).json({
            data: user,
            message: "User record has been deleted successfully",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        console.log(
            `Error while deleting the record, User not Present ***${err}***`
        );
        res.status(500).json({
            data: {},
            message: "Something went wrong !",
            statusCode: 500,
            success: false,
        });
    }
};
// Code added my me - END
