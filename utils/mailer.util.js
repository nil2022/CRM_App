// utils/mailer.util.js
import nodemailer from "nodemailer";
import Otp from "#models/otp";
import env from "#configs/env";
import chalk from "chalk";
import { generateOtp } from "#utils/general";
import httpStatus from "http-status";
import { otpMailTemplate } from "#root/assets/templates/otpTemplate";

export async function sendMail(fullName, ownerId, ownerModel, toAddress) {
    // Basic input validation
    if (!fullName || !ownerId || !ownerModel || !toAddress) {
        throw { status: httpStatus.BAD_REQUEST, message: "Missing required parameters for sendMail" };
    }
    // Simple email format validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(toAddress)) {
        throw { status: httpStatus.BAD_REQUEST, message: `Invalid email address: ${toAddress}` };
    }
    // Ensure mail configuration variables are present
    const requiredEnv = ["MAIL_HOST", "MAIL_PORT", "MAIL_AUTH_SECURE", "MAIL_USER", "MAIL_PASS", "MAIL_FROM_ADDRESS"];
    for (const key of requiredEnv) {
        if (!env[key]) {
            throw { status: httpStatus.INTERNAL_SERVER_ERROR, message: `Missing environment variable: ${key}` };
        }
    }
    try {
        const existingOtp = await Otp.findById(ownerId);
        if (existingOtp) {
            throw {
                status: httpStatus.BAD_REQUEST,
                message: `OTP already sent to user '${fullName} => [${toAddress}]`,
            };
        }
        // generate new OTP
        const OTP = generateOtp(6);
        console.log(chalk.green(`OTP ===>> ${OTP}`));
        await Otp.create({ otp: OTP, ownerId, ownerModel }); // expire after 10 minutes
        const transporter = nodemailer.createTransport({
            host: env.MAIL_HOST,
            port: env.MAIL_PORT,
            secure: env.MAIL_AUTH_SECURE,
            auth: {
                user: env.MAIL_USER,
                pass: env.MAIL_PASS,
            },
        });
        const html = otpMailTemplate(fullName, OTP);
        const info = await transporter.sendMail({
            from: env.MAIL_FROM_ADDRESS,
            to: toAddress,
            subject: "Verify your email to activate your account ✅",
            html: html,
        });

        if (info.accepted) {
            console.log(chalk.green(`sendMail :: OTP email sent to ${toAddress} successfully`));
        }
        return info;
    } catch (error) {
        console.log(chalk.red("sendMail :: Error ::", error.message || error));
        // Propagate the error so callers can handle it appropriately
        throw error;
    }
}
