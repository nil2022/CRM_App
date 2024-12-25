import connectDB from "./configs/db.config.js";
import { app } from "./app.js";
import { User } from "./models/user.model.js";
import { userStatus, userTypes } from "./utils/constants.js";
const PORT = process.env.PORT || 3000

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
            console.log(`Welcome SYSTEM ADMINISTRATOR, [${systemAdminUser.fullName}] !`);
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

        console.log(`Welcome SYSTEM ADMINISTRATOR, [${systemAdminUser.fullName}] !`);
    } catch (err) {
        console.log("SYSTEM Initialization FAILED!!", err.message);
    }
}

connectDB()
    .then(() => {
        initialize();
        app.listen(PORT, () => {
            console.log(`⚙️ Listening all requests at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection FAILED !!! : ", error);
    });
