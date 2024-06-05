import nodemailer from "nodemailer";
import generateRandomString from "./randomString.js";
import { Otp } from "../models/otp.model.js";

const OTP = generateRandomString(6);

export async function sendMail(fullName, userId, fromAddress, toAddress) {

    try {
        await Otp.create({ otp: OTP, userId })
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailBody = `
            <h3>Hello ${fullName} !</h3>
            <p>This is your <strong>OTP</strong> to verify your email. This <strong>OTP</strong> is for valid for 2 hours.</p><br/>
            <h1>${OTP}</h1><br/>
            <br/>
            CRM Service Team 😊 | Happy to help !
            `;

        const info = await transporter.sendMail({
            from: fromAddress,
            to: toAddress,
            subject: 'OTP confirmation alert for CRM Service',
            html: mailBody,
        });

        return info;

    } catch (error) {
        console.log("Mail Error: ", error);
        throw error;
    }
}
