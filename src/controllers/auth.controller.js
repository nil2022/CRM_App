import { User } from "../models/user.model.js";
import { userStatus, userTypes } from "../utils/constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mailSender.js";
import { Otp } from "../models/otp.model.js";
import { Octokit } from "octokit";
import asyncHandler from "../utils/asyncHandler.js";
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from "../utils/ApiError.js";
const senderAddress = process.env.MAIL_FROM_ADDRESS;

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
export const signup = asyncHandler(async (req, res) => {
    let userStatusReq;
    const { fullName, userId, email, password, userType } = req.body;

    if (userType === userTypes.engineer || userType === userTypes.admin) {
        userStatusReq = userStatus.pending;
    } else {
        userStatusReq = userStatus.approved;
    }

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
    await sendMail(fullName, userId, senderAddress, `${fullName} <${email}>`);

    res.status(201).json({
        data: {
            user: registeredUser,
        },
        message: "Users registered successfully and verification email has been sent on your email.",
        statusCode: 200,
        success: true,
    });
});

/** CONTROLLER TO VERIFY USER EMAIL ID USING OTP */
export const verifyUser = asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;

    const savedOtp = await Otp.findOne({ userId: { $eq: userId } });

    if (!savedOtp) throw new NotFoundError("OTP not found!");

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
        throw new BadRequestError("Invalid OTP!");
    }
});

/**
 * * This controller logs in User into the system
 */
export const signin = asyncHandler(async (req, res) => {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId: { $eq: userId } });

    if (!user) {
        console.log("Failed! UserId doesn't exist!");
        throw new BadRequestError("Failed! UserId doesn't exist!");
    }

    console.log(`Signin Request for userId -> [${user.userId}]`);

    if (!user.isEmailVerified) {
        console.log("Please verify your Email!");
        throw new BadRequestError("Please verify your Email!");
    }
    /** CHECK IF PASSWORD IS IN STRING FORMAT */
    if (typeof password !== "string") {
        console.log(`Invalid Password! Password type is [${typeof password}]`);
        throw new BadRequestError("Invalid Password!");
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    /** CHECK IF PASSWORD IS VALID */
    if (!passwordIsValid) {
        console.log(`Invalid Password!`);
        throw new UnauthorizedError("Invalid Password!");
    }
    /** CHECK IF USER IS APPROVED */
    if (user.userStatus !== userStatus.approved) {
        console.log(`User NOT APPROVED, Contact \n ADMIN !`);
        throw new ForbiddenError("User NOT APPROVED, Contact \n ADMIN !");
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

    console.log(`[${loggedInUser.fullName}] signed in successfully!`);

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
});

/**
 * This controller fethes current logged in user
 */
export const getLoggedInUser = asyncHandler(async (req, res) => {
    const user = await User.findById({ _id: req.decoded._id });

    if (!user) {
        console.log("User not found");
        throw new NotFoundError("User not found");
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
});

// TODO: controllers to design
/**
 * update accountdetails
 * update Avatar (LATER)
 * update User coverimage (LATER)
 */

/**
 * This controller changes current user password
 */
export const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (newPassword === "" || newPassword === null || oldPassword === "" || oldPassword === null) {
        console.log("Passwords can't be empty!");
        throw new BadRequestError("Passwords can't be empty!");
    }

    const user = await User.findById(req.decoded._id);
    const isPasswordValid = await user.isValidPassword(oldPassword);

    if (!isPasswordValid) {
        console.log("Invalid Old Password!");
        throw new BadRequestError("Invalid Old Password!");
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
});

/**
 * This controller refreshes access token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        console.log("Unauthorized request!");
        throw new UnauthorizedError("Unauthorized request!");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        console.log("Error while refreshing access token ::", error);
        throw new UnauthorizedError("Invalid Refresh Token!");
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
        console.log("Invalid refresh token!");
        throw new UnauthorizedError("Invalid Refresh Token!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        console.log("Invalid refresh token!");
        throw new UnauthorizedError("Refresh token expired for user");
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
});

/**
 * This controller logs out the user
 */
export const logout = asyncHandler(async (req, res) => {
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
        httpOnly: true,
        secure: true,
    };

    console.log(`userId -> [${String(req.decoded.userId).replace(/[\r\n]/g, "")}], Logged Out Successfully !!`);

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
});

/* Change logic as per requirement*/
export const handleSocialAuth = asyncHandler(async (req, res) => {

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };
    console.log('====================================');
    console.log(req.user);
    console.log('====================================');
    const octokit = new Octokit({
        auth: req.user.accessToken,
    });
    const { data } = await octokit.request("GET /user/emails", {
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    let user = await User.findOne({ email: data[0].email });

    console.log('================= git hub user email =================');
    console.log( data[0].email);
    console.log('======================================================');
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
});
