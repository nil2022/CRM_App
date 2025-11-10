// controllers/auth.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Otp from "#models/otp";
import User from "#models/user";
import { Octokit } from "octokit";
import { userStatus, userTypes } from "#utils/constants";
import { sendMail } from "#utils/mailSender";
import { sendResponse } from "#utils/sendResponse";
import env from "#configs/env";

const senderAddress = env.MAIL_FROM_ADDRESS;

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
            loginType: "OTP",
            userType: userType ? userType.toUpperCase() : userTypes.customer,
            password,
            userStatus: userStatusReq,
        });

        const registeredUser = {
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
        console.log("User Registered Successfully");

        // Send Email with OTP to verify User Email
        const emailResponse = await sendMail(fullName, userId, senderAddress, `${fullName} <${email}>`);

        res.status(201).json({
            data: {
                user: registeredUser,
            },
            message: "Users registered successfully and verification email has been sent on your email.",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        console.log(`${err.message}`, `${err.name}:${err.message}`, err);
        res.status(500).json({
            data: "",
            message: "Something went wrong!",
            statusCode: 500,
            success: false,
        });
    }
};

/** CONTROLLER TO VERIFY USER EMAIL ID USING OTP */
export const verifyUser = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const savedOtp = await Otp.findOne({ userId: { $eq: userId } });
        // console.log('savedOtp', savedOtp)

        if (!savedOtp)
            return res.status(404).json({
                data: "",
                message: "OTP not found!",
                statusCode: 404,
                success: false,
            });

        if (savedOtp.otp === otp) {
            console.log({ message: "User verified" });
            await User.findOneAndUpdate({ userId: { $eq: userId } }, { isEmailVerified: true });
            await Otp.deleteOne({ userId: { $eq: userId } });

            return res.status(200).json({
                data: "",
                message: "User verified successfully!",
                statusCode: 200,
                success: true,
            });
        } else {
            console.log("Invalid OTP");
            return res.status(400).json({
                data: "",
                message: "Invalid OTP!",
                statusCode: 400,
                success: false,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            data: "",
            message: error.message,
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

    if (!user) {
        return res.status(400).json({
            data: "",
            message: "Failed! UserId doesn't exist!",
            statusCode: 400,
            success: false,
        });
    }

    if (!user.isEmailVerified) {
        return sendResponse(res, 400, null, "Please verify your Email!");
    }
    /** CHECK IF PASSWORD IS IN STRING FORMAT */
    if (typeof password !== "string") {
        console.log(`Invalid Password! Password type is [${typeof password}]`);
        return sendResponse(res, 400, null, "Invalid Password! Password must be a string", {});
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    /** CHECK IF PASSWORD IS VALID */
    if (!passwordIsValid) {
        return sendResponse(res, 401, null, "Invalid Password!");
    }
    /** CHECK IF USER IS APPROVED */
    if (user.userStatus !== userStatus.approved) {
        console.log(`User NOT APPROVED, Contact ADMIN !`);
        return sendResponse(res, 403, null, "User NOT APPROVED, Contact ADMIN !");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

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
        httpOnly: true,
        secure: true,
    };

    console.log(`[${loggedInUser.fullName}], Role:-> [${loggedInUser.userType}]  signed in successfully!`);

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
            console.log("User not found");
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

        // console.log(`Current Logged in User (userId) -> [${user.userId}] fetched success`);

        res.status(200).json({
            data: userData,
            message: "Current user fetched successfully",
            statusCode: 200,
            success: true,
        });
    } catch (error) {
        console.log(error);
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
 * update accountdetails
 * update Avatar (LATER)
 * update User coverimage (LATER)
 */

/**
 * This controller changes current user password
 */
export const changeCurrentUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        if (newPassword === "" || newPassword === null || oldPassword === "" || oldPassword === null) {
            console.log("Passwords can't be empty!");
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
            console.log("Invalid Old Password!");
            return res.status(400).json({
                data: "",
                message: "Invalid Old Password!",
                statusCode: 400,
                success: false,
            });
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        console.log(`Password changed successfully for userId -> [${user.userId}]`);

        return res.status(200).json({
            data: "",
            message: "Password changed successfully!",
            statusCode: 200,
            success: true,
        });
    } catch (err) {
        console.log(`Error occured in updating password`, err);
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
        req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        console.log("Unauthorized request!");
        return res.status(401).json({
            data: "",
            message: "Unauthorized request!",
            statusCode: 401,
            success: false,
        });
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);

        if (!user) {
            console.log("Invalid refresh token!");
            return res.status(401).json({
                data: "",
                message: "Invalid Refresh Token!",
                statusCode: 401,
                success: false,
            });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            console.log("Invalid refresh token!");
            return res.status(401).json({
                data: "",
                message: "Refresh token expired for user",
                statusCode: 401,
                success: false,
            });
        }

        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        console.log(`Access token refreshed successfully for userId -> [${user.userId}]`);

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
        console.log("Error while refreshing access token ::", error);
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
            httpOnly: true,
            secure: true,
        };

        console.log(`userId -> [${req.decoded.userId}], Logged Out Successfully !!`);

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
        console.log(error);
        res.status(500).json({
            data: "",
            message: "Internal server error",
            statusCode: 500,
            success: false,
        });
    }
};

/* Change logic as per requirement*/
export const handleSocialAuth = async (req, res) => {
    const options = {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
    };
    console.log("====================================");
    console.log(req.user);
    console.log("====================================");
    const octokit = new Octokit({
        auth: req.user.accessToken,
    });
    const { data } = await octokit.request("GET /user/emails", {
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    let user = await User.findOne({ email: data[0].email });

    console.log("================= git hub user email =================");
    console.log(data[0].email);
    console.log("======================================================");
    // if (!user) {
    // create new user  and generate tokens and redirect
    // user = await User.create({
    //     fullName:req.user.username,
    //     userId: req.user.githubId,
    //     email: data[0].email,
    //     loginType: "GITHUB",
    //     avatar: req.user.avatar_url,
    //     userType:  userTypes.customer,
    // password,
    // userStatus: userStatusReq,
    // });
    // }
    // if user exists, just generate tokens and redirect
    // const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken("67398a5004e171d92456b1fa");

    return res
        .status(200)
        .cookie("accessToken", accessToken, options) // set the access token in the cookie
        .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
        .redirect(
            // redirect user to the frontend with access and refresh token in case user is not using cookies
            `http://localhost:3000/api/v1/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
        );
};
