import connectDB from "./configs/db.config.js";
import { app } from "./app.js";
import { User } from "./models/user.model.js";
import { userStatus, userTypes } from "./utils/constants.js";

/**
 * * Create Master Administrator User and Login to the System
 */
// async function initialize() {
//     try {
//         let systemAdminUser;
        
//         systemAdminUser = await User.findOne({
//             userId: { $eq: process.env.ADMIN_USERID },
//         });

//         if (systemAdminUser) {
//             console.log(`Welcome SYSTEM ADMINISTRATOR, [${systemAdminUser.fullName}] !`);
//             return;
//         }

//         systemAdminUser = await User.create({
//             fullName: process.env.ADMIN_NAME,
//             userId: process.env.ADMIN_USERID,
//             email: process.env.ADMIN_EMAIL,
//             userType: userTypes.admin,
//             password: process.env.ADMIN_PASSWORD,
//             isEmailVerified: true,
//             userStatus: userStatus.approved,
//         });

//         console.log(`Welcome SYSTEM ADMINISTRATOR, [${systemAdminUser.fullName}] !`);
//     } catch (err) {
//         console.log("SYSTEM Initialization FAILED!!", err.message);
//     }
// }

async function initialize() {
    try {
        let systemAdminUser;

        // Log the start of the initialization process
        console.log("Initializing SYSTEM ADMINISTRATOR...");
        
        // Try to find existing user
        try {
            systemAdminUser = await User.findOne({
                userId: { $eq: process.env.ADMIN_USERID },
            });
            
            if (systemAdminUser) {
                console.log(`SYSTEM ADMINISTRATOR found: ${systemAdminUser.fullName}`);
                return;
            }
        } catch (err) {
            console.error("Error finding SYSTEM ADMINISTRATOR:", err);
            throw new Error(`Failed to find SYSTEM ADMINISTRATOR: ${err.message}`);
        }

        // If user not found, create a new one
        try {
            systemAdminUser = await User.create({
                fullName: process.env.ADMIN_NAME,
                userId: process.env.ADMIN_USERID,
                email: process.env.ADMIN_EMAIL,
                userType: userTypes.admin,
                password: process.env.ADMIN_PASSWORD,
                isEmailVerified: true,
                userStatus: userStatus.approved,
            });

            console.log(`Created new SYSTEM ADMINISTRATOR: ${systemAdminUser.fullName}`);
        } catch (err) {
            console.error("Error creating SYSTEM ADMINISTRATOR:", err);
            throw new Error(`Failed to create SYSTEM ADMINISTRATOR: ${err.message}`);
        }

        // Log the completion of the initialization process
        console.log("SYSTEM ADMINISTRATOR initialized successfully");
    } catch (err) {
        console.error("Initialization failed:", err);
        // Optionally, log additional error details or handle the failure
        throw new Error(`SYSTEM Initialization FAILED: ${err.message}`);
    }
}


try {
    connectDB()
        .then(() => {
            initialize();
            // app.listen(process.env.PORT || 3000, () => {
            //     console.log(`⚙️ Listening all requests at http://localhost:${process.env.PORT}`);
            // });
        })
        // .catch((error) => {
        //     console.log("MongoDB Connection FAILED !!! : ", error);
        //     throw new Error("MongoDB Connection FAILED !!! : ");
        // });
} catch (error) {
    throw new Error("Server Connection FAILED !!! : ", error);
}

app.listen(process.env.PORT || 3000, () => {
    console.log(`⚙️ Listening all requests at http://localhost:${process.env.PORT}`);
});
