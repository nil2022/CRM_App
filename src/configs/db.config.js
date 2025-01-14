import mongoose from 'mongoose';

export default async function connectDB() {
    /**
     * When you set `mongoose.set('strictQuery', true)`, it enforces strict mode 
     * for query operations as well. This means that Mongoose will filter out 
     * fields not in the schema before executing the query.
     */
    try {
        mongoose.set('strictQuery', true)
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected !! DB Host:-> ${connectionInstance.connection.host}`);
    } catch (error) {
        throw new Error(error);
    }
}