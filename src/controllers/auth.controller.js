import { User } from "../models/user.model.js";
import { userStatus, userTypes } from "../utils/constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* -------- GENERATE ACCESS AND REFRESH TOKEN ----------- */
async function generateAccessAndRefreshToken(userId) {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

/* -------- SIGNUP API----------- */
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
        console.log({
            message: "User Registered Successfully",
            data: {
                email: registeredUser.email,
            },
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
        console.log(
            "Something went wrong while saving to DB",
            `${err.name}:${err.message}`
        );
        res.status(500).send({
            message: "Some internal error while inserting the element",
        });
    }
};

/* -------- SIGNIN API----------- */
export const signin = async (req, res) => {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId: { $eq: userId.toLowerCase() } });
    console.log("Signin Request for userId:", user.userId);

    if (!user) {
        res.status(400).send("Failed! UserId doesn't exist!");
        return;
    }
    /** CHECK IF PASSWORD IS IN STRING FORMAT */
    if (typeof password !== "string") {
        console.log(`Invalid Password! Password type is [${typeof password}]`);
        return res.status(400).send("Invalid Password!");
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    /** CHECK IF PASSWORD IS VALID */
    if (!passwordIsValid) {
        console.log("Invalid Password!");
        return res.status(401).send({
            message: "Invalid Password!",
        });
    }
    /** CHECK IF USER IS APPROVED */
    if (user.userStatus !== userStatus.approved) {
        console.log(
            `Can't allow login as user is in "${user.userStatus}" status`
        );
        return res.status(403).json({
            data: '',
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

    console.log(`[${loggedInUser.fullName}] signed in successfully!`);

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .set("Authorization", `Bearer ${accessToken}`)
        .set("x-access-token", accessToken)
        .set("x-refresh-token", refreshToken)
        .json({
            data: {
                accessToken,
                refreshToken,
                user: loggedInUser,
            },
            message: "User logged in successfully ✅",
            statusCode: 200,
            success: true,
        });
};

/* -------- GET LOGGED IN USER API----------- */
export const getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.decoded._id });
        console.log("Current User: ", user);

        if (!user) {
            return res.status(404).json({
                data: {},
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

        res.status(200).json({
            data: userData,
            message: "Current user fetched successfully",
            statusCode: 200,
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            data: {},
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

/* -------- REFRESH ACCESS TOKEN API----------- */
export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken ||
        req.body.refreshToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        return res.status(401).json({
            statusCode: 401,
            data: null,
            success: false,
            errors: [],
            message: "Unauthorized request!",
        });
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res.status(401).json({
                data: null,
                message: "Invalid Refresh Token!",
                statusCode: 401,
                success: false,
            });
        }

        console.log("user:", user.refreshToken);

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({
                data: null,
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
        console.log("Error while refreshing access token", error.message);
        return res.status(401).json({
            message: "Invalid Refresh Token!",
        });
    }
};

/* -------- LOGOUT API----------- */
export const logout = async (req, res) => {
    // remove the refresh token field
    // clear the cookies
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

    console.log("User Logged Out Successfully !!");

    res.status(200)
        .clearCookie("refreshToken", cookieOptions)
        .clearCookie("accessToken", cookieOptions)
        .set("Authorization", "")
        .json({
            data: "",
            message: "User Logged Out Successfully !! ✅",
            statusCode: 200,
            success: true,
        });
};
