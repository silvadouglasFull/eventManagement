import { configDotenv } from 'dotenv';
import { Db, MongoClient } from 'mongodb';
import { Logger } from '../core/Logger';
configDotenv()
const url = process.env.MONGO_URL;
if (!url) throw new Error('MONGO_URL environment variable is not set.');
const client = new MongoClient(url);
let db: Db;

export async function connectToMongo(): Promise<Db> {
    if (db) {
        Logger.info('MongoDB', 'Using existing connection.');
        return db;
    }

    try {
        await client.connect();
        db = client.db('notifications');
        Logger.info('MongoDB', 'Connected to MongoDB.');
        return db;
    } catch (error) {
        Logger.error('MongoDB', 'Failed to connect to MongoDB.', error);
        throw error;
    }
}

export function getMongoClient(): MongoClient {
    if (!client) {
        throw new Error("MongoDB client has not been initialized. Call connectToMongo() first.");
    }
    return client;
}