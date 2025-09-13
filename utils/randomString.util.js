// utils/randomString.util.js

/** GENERATE OTP OF DESIRED LENGTH */
export default function randomString(length) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * length)];
    }
    return otp;
}

// console.log(randomString(6))