import connectDB from "./configs/db.config.js";
import { app } from "./app.js";
import { User } from "./models/user.model.js";
import { userStatus, userTypes } from "./utils/constants.js";

// Create System User and log in into App
async function initialise() {
    const user = await User.findOne({
        userId: { $eq: process.env.ADMIN_USERID },
    });

    if (user) {
        // console.log('Admin user already present', user)
        console.log("Welcome System Administrator!");
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

        console.log("Welcome System Administrator!");
    } catch (err) {
        console.log("Error creating user!", err.message);
    }
}

connectDB()
    .then(() => {
        initialise();
        app.listen(process.env.SERVER_PORT || 3000, () => {
            console.log(
                `⚙️  Listening all requests at http://localhost:${process.env.SERVER_PORT}`
            );
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection FAILED !!! : ", error.message);
    });
