import connectDB from "#configs/db";
import app from "#configs/app";
import env from "#configs/env";
import Admin from "#models/admin";
import PORT from "#configs/server";

connectDB().then(async () => {
    (async function verifySystemAdmin() {
        try {
            const systemAdmin = await Admin.findOne({
                email: env.ADMIN_EMAIL,
                role: "SUPER_ADMIN",
            });

            if (systemAdmin) {
                console.log(`✅ SYSTEM ADMINISTRATOR verified: ${systemAdmin.fullName}`);
            } else {
                console.warn("⚠️  No SYSTEM ADMINISTRATOR found! Run admin seed script to create one.");
                process.exit(1);
            }
        } catch (err) {
            console.error("Error verifying SYSTEM ADMINISTRATOR:", err);
            process.exit(1);
        }
    })();

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}/crm`);
    });
});
