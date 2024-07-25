import nodemailer from "nodemailer";
import generateRandomString from "./randomString.js";
import { Otp } from "../models/otp.model.js";

// const currentTime = new Date(Date.now());
// console.log(currentTime)

export async function sendMail(fullName, userId, fromAddress, toAddress) {

    try {
        const existingOtp = await Otp.findOne({ userId: { $eq: userId } })
        if (existingOtp) {
            throw new Error(`OTP already sent to user with 'userId' => [${userId}]`)
        }
        // generate new OTP
        const OTP = generateRandomString(6);
        await Otp.create({ otp: OTP, userId}) // expire after 2 hours
        await Otp.createIndexes({ "expireAt": 1 }, { expireAfterSeconds: 0 })
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailBody = `
            <h3>Hello ${fullName} !</h3>
            <p>Enter the following <strong>OTP</strong> when prompted to verify your email.</p>
            <p>This code will expire in 2 hours.</p>
            <h1>${OTP}</h1>
            <hr/>
            CRM Service Team 😊 | Happy to help !
            `;

            
        const info = await transporter.sendMail({
            from: fromAddress,
            to: toAddress,
            subject: 'OTP confirmation alert for CRM Service',
            html: mailBody,
        });

        if (info.accepted) {
            console.log({message: 'OTP sent successfully'});
        }
        return info;

    } catch (error) {
        console.log("mailSender :: error ::", error);
        throw error;
    }
}
