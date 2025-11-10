import connectDB from "#configs/db";
import app from "#configs/app";
import User from "#models/user";
import env from "#configs/env";

let PORT = 3000;

if (env.NODE_ENV !== "development") {
    PORT = env.PORT;
}

connectDB().then(async () => {
    (async function verifySystemAdmin() {
        try {
            const systemAdminUser = await User.findOne({
                userId: env.ADMIN_USERID,
            });

            if (systemAdminUser) {
                console.log(`✅ SYSTEM ADMINISTRATOR verified: ${systemAdminUser.fullName}`);
            } else {
                console.warn("⚠️  No SYSTEM ADMINISTRATOR found! Run seed script to create one.");
            }
        } catch (err) {
            console.error("Error verifying SYSTEM ADMINISTRATOR:", err);
        }
    })();

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}/crm`);
    });
});
