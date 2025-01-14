import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param {object} error :- error object
 *# Function to store error in error log file
 * @example
 * storeError(error)
 */
export const storeError = async (error) => {
    console.log(error);
    const currentTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
    });
    const errorMessage = `${currentTime} - Error: ${error.stack}\n`;
    try {
        if(!fs.existsSync("public/logs")) {
            await fs.mkdir("public/logs");
        }
        await fs.appendFile("public/logs/error.log", errorMessage);
    } catch (err) {
        console.error("Error writing to error log:", err);
    }
};

/**
 *
 * @param {*} res :- response
 * @param {*} statusCode :- status code
 * @param {*} message :- message
 * @param {*} data :- data
 * @param {*} totalCount :- total count
 *# Function for success return message
 * @example
 * sendSuccessResponse(res, statusCode, message, data, totalCount)
 */
export const sendSuccessResponse = (res, statusCode, message, data = [], totalCount = null) => {
    return res.status(statusCode).json({
        status: true,
        message: message,
        data,
        totalCount,
    });
};

/**
 *
 * @param {*} res :- response
 * @param {*} statusCode :- status code
 * @param {*} message :- message
 *# Function for error return message
 * @example
 * sendErrorResponse(res, statusCode, message)
 */
export const sendErrorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        status: false,
        message: message,
    });
};

/**
 *
 * @param {*} folder :- folder name
 * @param {*} file :- file name
 *# Function to upload file to folder
 * @example
 * uploadFile(folderName, fileName)
 */
export const uploadFile = async (folder, file) => {
    file = Array.isArray(file) ? file : [file];
    return Promise.all(
        file.map(async (file) => {
            const fileName = `${Date.now()}_${file.name}`;
            await file.mv(path.join(__dirname, `../public/${folder}/`, fileName));
            return `'${folder}/${fileName}'`;
        })
    );
};

/**
 *
 * @param {*} fileName :- file name
 * # Function to delete file from folder
 * @example
 * deleteFile(fileName)
 */
export const deleteFile = async (fileName) => {
    const oldImagePath = path.join(__dirname, "..", "public", fileName);

    // Ensure the path is properly escaped
    const oldImagePathEscaped = oldImagePath.replace(/\\/g, "/");
    const cleanedPath = oldImagePathEscaped.replace(/'/g, "");
    const normalizedPath = path.normalize(cleanedPath);

    if (fs.existsSync(normalizedPath)) {
        fs.unlinkSync(normalizedPath);
    } else {
        console.log("File does not exist at the path:", normalizedPath);
    }
};

/**
 * @param {object} payload :- payload
 *# Generate Jwt Token */
export const generateJwtToken = (payload) => {
    try {
        const secretKey = process.env.ACCESS_TOKEN_SECRET;
        const expiryTime = process.env.ACCESS_TOKEN_EXPIRY || "1d";
        const token = jwt.sign(payload, secretKey, { expiresIn: expiryTime });
        return token;
    } catch (error) {
        storeError(error);
        return false;
    }
};

/**
 *
 * @param {*} password :- password
 *# Function to Encrypt password
 * @example
 * encryptPassword(password)
 */
export const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

/**
 *
 * @param {*} password :- password
 * @param {*} hash :- hash
 *# Function to compare password
 * @example
 * comparePassword(password, hashedPassword)
 */
export const comparePassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};
