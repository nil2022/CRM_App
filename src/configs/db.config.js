import mongoose from 'mongoose';

export default async function connectDB() {
    /**
     * When you set `mongoose.set('strictQuery', true)`, it enforces strict mode 
     * for query operations as well. This means that Mongoose will filter out 
     * fields not in the schema before executing the query.
     */
    try {
        mongoose.set('strictQuery', true);

        // Check if the MONGODB_URI environment variable is set
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set.');
        }

        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected !! DB Host:-> ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);

        // Exit the process with a failure code if the connection fails
        process.exit(1);
    }
}