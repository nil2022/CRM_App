// utils/mailSender.util.js
import nodemailer from "nodemailer";
import Otp from "#models/otp";
import env from "#configs/env";
import chalk from "chalk";
import { generateOtp } from "#utils/general";
import httpStatus from "http-status";

// const currentTime = new Date(Date.now());
// console.log(currentTime)

export async function sendMail(fullName, ownerId, ownerModel, toAddress) {

    try {
        const existingOtp = await Otp.findById(ownerId);
        if (existingOtp) {
            throw {
                status: httpStatus.BAD_REQUEST,
                message: `OTP already sent to user '${fullName} => [${toAddress}]`,
            }
        }
        // generate new OTP
        const OTP = generateOtp(6);
        console.log(chalk.green(`OTP ===>> ${OTP}`))
        await Otp.create({ otp: OTP, ownerId, ownerModel}) // expire after 10 minutes
        const transporter = nodemailer.createTransport({
            host: env.MAIL_HOST,
            port: env.MAIL_PORT,
            secure: env.MAIL_AUTH_SECURE,
            auth: {
                user: env.MAIL_USER,
                pass: env.MAIL_PASS,
            },
        });

        const mailBody = `
            <h3>Hello ${fullName} !</h3>
            <p>Enter the following <strong>OTP</strong> when prompted to verify your email.</p>
            <p>This code will expire in 10 minutes.</p>
            <h1>${OTP}</h1>
            <hr/>
            CRM Service Team 😊 | Happy to help !
            `;

            
        const info = await transporter.sendMail({
            from: env.MAIL_FROM_ADDRESS,
            to: toAddress,
            subject: 'Verify your email to activate your account ✅',
            html: mailBody,
        });

        if (info.accepted) {
            console.log({message: 'OTP sent successfully'});
        }
        return info;

    } catch (error) {
        console.log(chalk.red("sendMail :: Error ::", error.message));
    }
}
