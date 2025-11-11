// seeds/seedAdmin.js
import connectDB from "#configs/db";
import env from "#configs/env";
import Admin from "#models/admin";

async function seedAdmin() {
    try {
        await connectDB();

        // Check for the admin using the email, which is a unique identifier
        let systemAdmin = await Admin.findOne({
            email: env.ADMIN_EMAIL,
        });

        if (systemAdmin) {
            console.log(`✅ SYSTEM ADMINISTRATOR already exists: ${systemAdmin.fullName}`);
            process.exit(0);
        }

        // Create the admin with fields matching the new Admin schema
        systemAdmin = await Admin.create({
            fullName: env.ADMIN_NAME,
            email: env.ADMIN_EMAIL,
            password: env.ADMIN_PASSWORD,
            role: "SUPER_ADMIN", // Set the role to SUPER_ADMIN
            status: "ACTIVE", // Set the status to ACTIVE
            isEmailVerified: true,
        });

        console.log(`🎉 Created SYSTEM ADMINISTRATOR: ${systemAdmin.fullName}`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to seed SYSTEM ADMINISTRATOR:", err);
        process.exit(1);
    }
}

seedAdmin();
