import connectDB from "./configs/db.config.js";
import { app } from "./app.js";
import { User } from "./models/user.model.js";
import { userStatus, userTypes } from "./utils/constants.js";
import { infoLogger, errorLogger } from "./utils/winstonLogger.js";

/**
 * * Create Master Administrator User and Login to the System
 */
async function initialize() {
    try {
        let systemAdminUser;
        
        systemAdminUser = await User.findOne({
            userId: { $eq: process.env.ADMIN_USERID },
        });

        if (systemAdminUser) {
            infoLogger.info(`Welcome SYSTEM ADMINISTRATOR, [${systemAdminUser.fullName}] !`);
            return;
        }

        systemAdminUser = await User.create({
            fullName: process.env.ADMIN_NAME,
            userId: process.env.ADMIN_USERID,
            email: process.env.ADMIN_EMAIL,
            userType: userTypes.admin,
            password: process.env.ADMIN_PASSWORD,
            isEmailVerified: true,
            userStatus: userStatus.approved,
        });

        infoLogger.info(`Welcome SYSTEM ADMINISTRATOR, [${systemAdminUser.fullName}] !`);
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
