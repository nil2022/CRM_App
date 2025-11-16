// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import Otp from "#models/otp";
import User from "#models/user";
import { Octokit } from "octokit";
import { loginType, userAndAdminStatus } from "#utils/constants";
import { sendMail } from "#utils/mailSender";
import env from "#configs/env";
import httpStatus from "http-status";
import chalk from "chalk";
import crypto from "crypto";
import { generateAccessAndRefreshToken, hashToken } from "#utils/general";

/**
 * * This controller Registers User
 */
export const signup = async (payload) => {
    // check existing user by email
    const { email, fullName } = payload;
    const existingUser = await User.findOne({ email: { $eq: email } });
    if (existingUser) {
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "Email already registered!",
        };
    }
    const user = await User.create(payload);

    // Send OTP to user email
    await sendMail(fullName, user._id, "User", user.email);

    return {
        message: "OTP has been sent to your email, please verify to activate your account.",
    };
};

/** CONTROLLER TO VERIFY USER EMAIL ID USING OTP */
export const verifyUser = async (payload) => {
    const { email, otp } = payload;
    const savedOtp = await Otp.findOne({ email: { $eq: email } });
    if (!savedOtp) {
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "OTP not found",
        };
    }

    if (savedOtp.otp === otp) {
        console.log(chalk.green("User verified successfully"));
        await User.findOneAndUpdate(
            { email: { $eq: email } },
            { isEmailVerified: true, status: userAndAdminStatus.active },
            { new: true }
        );
        // Update Otp as used
        savedOtp.isUsed = true;
        await savedOtp.save();

        return {
            message: "Email verified successfully",
        };
    } else {
        console.log("Invalid OTP");
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "Invalid OTP",
        };
    }
};

/**
 * * This controller logs in User into the system
 */
// export const signin = async (payload) => {
//     const { email, password } = payload;
//     const user = await User.findOne({ email: { $eq: email } }).select(
//         "fullName password isEmailVerified status role loginType lastLogin"
//     );
//     if (!user) {
//         throw {
//             status: httpStatus.BAD_REQUEST,
//             message: "Failed! UserId doesn't exist!",
//         };
//     }

//     if (!user.isEmailVerified) {
//         throw {
//             status: httpStatus.BAD_REQUEST,
//             message: "Please verify your Email!",
//         };
//     }
//     const passwordIsValid = await user.isValidPassword(password);
//     if (!passwordIsValid) {
//         throw {
//             status: httpStatus.BAD_REQUEST,
//             message: "Invalid Password!",
//         };
//     }
//     /** CHECK IF USER IS APPROVED */
//     if (user.status !== userAndAdminStatus.active) {
//         console.log(chalk.yellow(`User not approved, Contact ADMIN !`));
//         throw {
//             status: httpStatus.BAD_REQUEST,
//             message: "Access Denied, Verification Pending!",
//         };
//     }
//     const { accessToken, refreshToken, tokenId } = await generateAccessAndRefreshToken(user._id);
//     user.refreshToken = refreshToken;
//     user.loginType = loginType.password;
//     user.lastLogin = Date.now();
//     await user.save({ validateBeforeSave: false });
//     console.log(
//         chalk.grey(`[${user.lastLogin}] User:-> [${user.fullName}], Role:-> [${user.role}]  signed in successfully!`)
//     );

//     return {
//         message: "User Logged in successfully !",
//         accessToken,
//     };
// };

export const signin = async (payload, opts = {}) => {
    const { email, password } = payload;

    // find user (including password for verification)
    const user = await User.findOne({ email: { $eq: email } }).select(
        "fullName password isEmailVerified status role loginType lastLogin"
    );

    if (!user) {
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "Failed! UserId doesn't exist!",
        };
    }

    if (!user.isEmailVerified) {
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "Please verify your Email!",
        };
    }

    const passwordIsValid = await user.isValidPassword(password);
    if (!passwordIsValid) {
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "Invalid Password!",
        };
    }

    /** CHECK IF USER IS APPROVED */
    if (user.status !== userAndAdminStatus.active) {
        console.log(chalk.yellow(`User not approved, Contact ADMIN !`));
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "Access Denied, Verification Pending!",
        };
    }

    // generate tokens (this function should handle storing the hashed refresh token + jti in user's refreshSessions)
    // opts can include ip, userAgent etc: { ip: req.ip, userAgent: req.get('User-Agent') }
    const { accessToken, refreshToken, tokenId } = await generateAccessAndRefreshToken(user._id, {
        ip: opts.ip,
        userAgent: opts.userAgent,
    });

    // update loginType and lastLogin WITHOUT overwriting refreshSessions (atomic update)
    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                loginType: loginType.password,
                lastLogin: Date.now(),
            },
        }
    );

    console.log(
        chalk.grey(
            `[${new Date().toISOString()}] User:-> [${user.fullName}], Role:-> [${user.role}] signed in successfully!`
        )
    );

    // return both tokens so frontend can store refreshToken and attach to header on refresh calls
    return {
        message: "User Logged in successfully !",
        accessToken,
        refreshToken,
    };
};

/**
 * This controller fethes current logged in user
 */
export const getLoggedInUser = async (loggedInUser) => {
    const { _id } = loggedInUser;
    const user = await User.findById(_id).select("-password -__v -refreshToken");
    if (!user) {
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "User not found",
        };
    }
    return user;
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
export const changeCurrentUserPassword = async (payload, loggedInUser) => {
    const { oldPassword, newPassword } = payload;
    const user = await User.findById(loggedInUser._id).select("fullName password");
    const isPasswordValid = await user.isValidPassword(oldPassword);

    if (!isPasswordValid) {
        throw {
            status: httpStatus.BAD_REQUEST,
            message: "Invalid Old Password!",
        };
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return {
        message: "Password changed successfully !",
    };
};

const timingSafeCompare = (a, b) => {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
};

/**
 * This controller refreshes access token
 */
export const refreshAccessToken = async (incomingRefreshToken, opts = {}) => {
    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        console.log(chalk.red("Invalid/expired refresh token"), err.message);
        throw {
            status: httpStatus.UNAUTHORIZED,
            message: "Invalid/expired refresh token",
        };
    }

    const tokenId = decoded.jti;
    if (!tokenId) {
        console.log(chalk.red("Missing jti in refresh token"));
        throw {
            status: httpStatus.UNAUTHORIZED,
            message: "Invalid refresh token",
        };
    }

    const user = await User.findById(decoded._id).select("fullName refreshSessions");
    if (!user) {
        throw {
            status: httpStatus.UNAUTHORIZED,
            message: "User not found",
        };
    }

    // Find stored session by tokenId
    const session = user.refreshSessions.find((s) => s.tokenId === tokenId);
    const incomingHash = hashToken(incomingRefreshToken);

    // If no session found => possible reuse (or logout) -> revoke all sessions
    if (!session) {
        // revoke all: clear refreshSessions
        user.refreshSessions = [];
        await user.save({ validateBeforeSave: false });
        console.log(chalk.red(`Refresh token reuse or invalid jti detected for user ${user._id}`));
        throw {
            status: httpStatus.UNAUTHORIZED,
            message: "Refresh token revoked. Please login again.",
        };
    }

    // Compare stored hash with incoming
    if (!timingSafeCompare(incomingHash, session.tokenHash)) {
        // hash mismatch -> compromise: remove that session or all sessions
        user.refreshSessions = user.refreshSessions.filter((s) => s.tokenId !== tokenId);
        await user.save({ validateBeforeSave: false });
        console.log(chalk.red("Refresh token hash mismatch — removed session"));
        throw {
            status: httpStatus.UNAUTHORIZED,
            message: "Invalid refresh token. Please login again.",
        };
    }

    // Optional: check session.expiresAt
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        // expired
        user.refreshSessions = user.refreshSessions.filter((s) => s.tokenId !== tokenId);
        await user.save({ validateBeforeSave: false });
        throw {
            status: httpStatus.UNAUTHORIZED,
            message: "Refresh token expired. Please login again.",
        };
    }

    // Rotate: remove the previous session, create a new refresh token and session
    user.refreshSessions = user.refreshSessions.filter((s) => s.tokenId !== tokenId);

    const {
        accessToken,
        refreshToken,
        tokenId: newTokenId,
    } = await generateAccessAndRefreshToken(user._id, {
        ip: opts.ip,
        userAgent: opts.userAgent,
    });

    // send tokens in response body (frontend will attach refresh token to header on next requests)
    return {
        message: "Access token refreshed",
        accessToken,
        refreshToken,
    };
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
