// seeds/seedAdmin.js
import connectDB from "#configs/db";
import env from "#configs/env";
import User from "#models/user";
import { userStatus, userTypes } from "#utils/constants";
import { generateSecurePassword } from "#utils/general";

async function seedAdmin() {
    try {
        await connectDB();

        let systemAdminUser = await User.findOne({
            userId: env.ADMIN_USERID,
        });

        if (systemAdminUser) {
            console.log(`✅ SYSTEM ADMINISTRATOR already exists: ${systemAdminUser.fullName}`);
            process.exit(0);
        }

        const generatedPassword = generateSecurePassword(20); // 20-char secure random password

        systemAdminUser = await User.create({
            fullName: env.ADMIN_NAME,
            userId: env.ADMIN_USERID,
            email: env.ADMIN_EMAIL,
            userType: userTypes.admin,
            password: generatedPassword, // should be hashed by mongoose middleware
            isEmailVerified: true,
            userStatus: userStatus.approved,
        });

        console.log(`🎉 Created SYSTEM ADMINISTRATOR: ${systemAdminUser.fullName}`);
        console.log("🔑 Generated secure password (store this safely!):", generatedPassword);

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to seed SYSTEM ADMINISTRATOR:", err);
        process.exit(1);
    }
}

seedAdmin();
