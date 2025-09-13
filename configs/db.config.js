// configs/db.config.js
import chalk from "chalk";
import mongoose from "mongoose";
import env from "#configs/env";

const dbUrl = env.MONGODB_URI;

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", true);

        if (!dbUrl) {
            throw new Error("MONGODB_URI environment variable is not set.");
        }

        const connectionInstance = await mongoose.connect(dbUrl);
        const { host, name: dbName } = connectionInstance.connection;
        console.log(chalk.bgGreen.black(` MongoDB Connected to DB Host:-> ${host} , DB Name:-> ${dbName} `));
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        // Exit the process with a failure code if the connection fails
        process.exit(1);
    }
};

export default connectDB;
