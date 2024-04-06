import connectDB from "./configs/db.config.js";
import { app } from "./app.js";
import { User } from "./models/user.model.js";
import { userStatus, userTypes } from "./utils/constants.js";
import { infoLogger, errorLogger } from "./utils/winstonLogger.js";

/**
 * * Create Master Administrator User and Login to the System
 * @returns 
 */
async function initialize() {
    const user = await User.findOne({
        userId: { $eq: process.env.ADMIN_USERID },
    });

    if (user) {
        infoLogger.info("Welcome System Administrator!");
        return;
    }

    try {
        const user = await User.create({
            fullName: process.env.ADMIN_NAME,
            userId: process.env.ADMIN_USERID,
            email: process.env.ADMIN_EMAIL,
            userType: userTypes.admin,
            password: process.env.ADMIN_PASSWORD,
            isEmailVerified: true,
            userStatus: userStatus.approved,
        });

        console.log(user);

        infoLogger.info("Welcome System Administrator!");
    } catch (err) {
        errorLogger.error(err, "Error creating user!", err.message);
    }
}

connectDB()
    .then(() => {
        initialize();
        app.listen(process.env.SERVER_PORT || 3000, () => {
            infoLogger.info(
                `⚙️ Listening all requests at http://localhost:${process.env.SERVER_PORT}`
            );
        });
    })
    .catch((error) => {
        errorLogger.error("MongoDB Connection FAILED !!! : ", error);
    });
