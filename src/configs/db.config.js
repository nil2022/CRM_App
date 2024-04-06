import mongoose from 'mongoose'
import { infoLogger } from '../utils/winstonLogger.js';

export default async function connectDB () {
    /**
     * When you set `mongoose.set('strictQuery', true)`, it enforces strict mode 
     * for query operations as well. This means that Mongoose will filter out 
     * fields not in the schema before executing the query.
     */
    mongoose.set('strictQuery', true)
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    infoLogger.info(`MongoDB Connected !! DB Host:-> ${connectionInstance.connection.host}`);
}