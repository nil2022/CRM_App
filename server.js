import connectDB from "#configs/db";
import app from "#configs/app";
import User from "#models/user";

async function verifySystemAdmin() {
    try {
        const systemAdminUser = await User.findOne({
            userId: process.env.ADMIN_USERID,
        });

        if (systemAdminUser) {
            console.log(`✅ SYSTEM ADMINISTRATOR verified: ${systemAdminUser.fullName}`);
        } else {
            console.warn("⚠️  No SYSTEM ADMINISTRATOR found! Run seed script to create one.");
        }
    } catch (err) {
        console.error("Error verifying SYSTEM ADMINISTRATOR:", err);
    }
}

connectDB().then(async () => {
    await verifySystemAdmin();

    app.listen(process.env.PORT || 3000, () => {
        console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
    });
});
