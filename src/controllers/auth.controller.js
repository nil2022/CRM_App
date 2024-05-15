import { User } from "../models/user.model.js";
import { userStatus, userTypes } from "../utils/constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    errorLogger,
    infoLogger,
    warningLogger,
} from "../utils/winstonLogger.js";

/**
 * * This controller Generates Access and Refresh Token
 */
async function generateAccessAndRefreshToken(userId) {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

/**
 * * This controller Registers User
 */
export const signup = async (req, res) => {
    let userStatusReq;
    const { fullName, userId, email, password, userType } = req.body;

    if (userType === userTypes.engineer || userType === userTypes.admin) {
        userStatusReq = userStatus.pending;
    } else {
        userStatusReq = userStatus.approved;
    }

    try {
        const user = await User.create({
            fullName,
            userId,
            email,
            userType: userType ? userType.toUpperCase() : userTypes.customer,
            password,
            userStatus: userStatusReq,
        });

        const registeredUser = {
            __v: user.__v,
            _id: user._id,
            fullName: user.fullName,
            userId: user.userId,
            email: user.email,
            avatar: user.avatar,
            loginType: user.loginType,
            isEmailVerified: user.isEmailVerified,
            userType: user.userType,
            userStatus: user.userStatus,
            createdAt: user.createdAt,
        };

        infoLogger.info({
            data: {
                email: registeredUser.email,
            },
            message: "User Registered Successfully",
        });

        res.status(201).json({
            data: {
                user: registeredUser,
            },
            message:
                "Users registered successfully and verification email has been sent on your email.",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        errorLogger.error(
            "Something went wrong while saving to DB",
            `${err.name}:${err.message}`,
            err
        );
        res.status(500).json({
            data: "",
            message: "Some internal error while inserting the element",
            statusCode: 500,
            success: false,
        });
    }
};

/**
 * * This controller logs in User into the system
 */
export const signin = async (req, res) => {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId: { $eq: userId } });
    infoLogger.info(`Signin Request for userId -> [${user.userId}]`);

    if (!user) {
        return res.status(400).json({
            data: "",
            message: "Failed! UserId doesn't exist!",
            statusCode: 400,
            success: false,
        });
    }
    /** CHECK IF PASSWORD IS IN STRING FORMAT */
    if (typeof password !== "string") {
        warningLogger.warn(
            `Invalid Password! Password type is [${typeof password}]`
        );

        return res.status(400).json({
            data: "",
            message: "Invalid Password!",
            statusCode: 400,
            success: false,
        });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    /** CHECK IF PASSWORD IS VALID */
    if (!passwordIsValid) {
        warningLogger.warn(`Invalid Password!`);
        return res.status(401).json({
            data: "",
            message: "Invalid Password!",
            statusCode: 401,
            success: false,
        });
    }
    /** CHECK IF USER IS APPROVED */
    if (user.userStatus !== userStatus.approved) {
        warningLogger.warn(`User NOT APPROVED, Contact \n ADMIN !`);
        return res.status(403).json({
            data: "",
            message: "User NOT APPROVED, Contact \n ADMIN !",
            statusCode: 403,
            success: false,
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = {
        __v: user.__v,
        _id: user._id,
        fullName: user.fullName,
        userId: user.userId,
        email: user.email,
        avatar: user.avatar,
        loginType: user.loginType,
        isEmailVerified: user.isEmailVerified,
        userType: user.userType,
        userStatus: user.userStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    const cookieOptions = {
        http: true,
        secure: true,
    };

    infoLogger.info(`[${loggedInUser.fullName}] signed in successfully!`);

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .set("Authorization", `Bearer ${accessToken}`)
        .json({
            data: {
                accessToken,
                refreshToken,
                user: loggedInUser,
            },
            message: "User Logged in successfully !",
            statusCode: 200,
            success: true,
        });
};

/**
 * This controller fethes current logged in user
 */
export const getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.decoded._id });

        if (!user) {
            warningLogger.warn("User not found");
            return res.status(404).json({
                data: "",
                message: "User not found",
                statusCode: 404,
                success: false,
            });
        }

        const userData = {
            __v: user.__v,
            _id: user._id,
            fullName: user.fullName,
            userId: user.userId,
            email: user.email,
            avatar: user.avatar,
            loginType: user.loginType,
            isEmailVerified: user.isEmailVerified,
            userType: user.userType,
            userStatus: user.userStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        infoLogger.info(
            `Current Logged in User (userId) -> [${user.userId}] fetched success`
        );

        res.status(200).json({
            data: userData,
            message: "Current user fetched successfully",
            statusCode: 200,
            success: true,
        });
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({
            data: "",
            message: "Internal server error",
            statusCode: 500,
            success: false,
        });
    }
};

// TODO: controllers to design
/**
 * change password
 * refreshtoken
 * uppdate accountdetails
 * update Avatar (LATER)
 * update User coverimage (LATER)
 */

/**
 * This controller changes current user password
 */
export const changeCurrentUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        if(newPassword === '' || newPassword === null || oldPassword === '' || oldPassword === null) {
            warningLogger.warn("Passwords can't be empty!");
            return res.status(400).json({
                data: "",
                message: "Passwords can't be empty!",
                statusCode: 400,
                success: false,
            });
        }

        const user = await User.findById(req.decoded._id);
        const isPasswordValid = await user.isValidPassword(oldPassword);

        if (!isPasswordValid) {
            warningLogger.warn("Invalid Old Password!");
            return res.status(400).json({
                data: "",
                message: "Invalid Old Password!",
                statusCode: 400,
                success: false,
            });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        infoLogger.info(`Password changed successfully for userId -> [${user.userId}]`);

        return res.status(200).json({
            data: "",
            message: "Password changed successfully!",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        errorLogger.error(`Error occured in updating password`, err);
        return res.status(500).json({
            data: "",
            message: "Internal server error",
            statusCode: 500,
            success: false,
        });
    }
};

/**
 * This controller refreshes access token
 */
export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken ||
        req.body.refreshToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        warningLogger.warn("Unauthorized request!");
        return res.status(401).json({
            data: "",
            message: "Unauthorized request!",
            statusCode: 401,
            success: false,
        });
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            warningLogger.warn("Invalid refresh token!");
            return res.status(401).json({
                data: "",
                message: "Invalid Refresh Token!",
                statusCode: 401,
                success: false,
            });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            warningLogger.warn("Invalid refresh token!");
            return res.status(401).json({
                data: "",
                message: "Refresh token expired for user",
                statusCode: 401,
                success: false,
            });
        }

        const cookieOptions = {
            http: true,
            secure: true,
        };

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        infoLogger.info(
            `Access token refreshed successfully for userId -> [${user.userId}]`
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .set("Authorization", `Bearer ${accessToken}`)
            .json({
                data: {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
                message: "Access Token refreshed successfully!",
                statusCode: 200,
                success: true,
            });
    } catch (error) {
        errorLogger.error("Error while refreshing access token ::", error);
        return res.status(401).json({
            data: "",
            message: "Invalid Refresh Token!",
            statusCode: 401,
            success: false,
        });
    }
};

/**
 * This controller logs out the user
 */
export const logout = async (req, res) => {
    // remove the refresh token field
    // clear the cookies
    try {
        await User.findByIdAndUpdate(
            req.decoded._id,
            {
                $unset: {
                    refreshToken: 1,
                },
            },
            {
                new: true,
            }
        );

        const cookieOptions = {
            http: true,
            secure: true,
        };

        infoLogger.info(
            `userId -> [${req.decoded.userId}], Logged Out Successfully !!`
        );

        res.status(200)
            .clearCookie("refreshToken", cookieOptions)
            .clearCookie("accessToken", cookieOptions)
            .set("Authorization", "")
            .json({
                data: "",
                message: "User Logged Out Successfully !",
                statusCode: 200,
                success: true,
            });
    } catch (error) {
        errorLogger.error(error);
        res.status(500).json({
            data: "",
            message: "Internal server error",
            statusCode: 500,
            success: false,
        });
    }
};
