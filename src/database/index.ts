import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db';
import { Logger } from '../core/Logger';
import * as schemas from '../modules/rooms/schemas/room';

let dbInstance: any | null = null;

export const connectToDatabase = async () => {
    if (dbInstance) {
        return dbInstance;
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const db = drizzle(connection, { schema: schemas, mode: 'default' });
        Logger.info('Database', 'Connection to the database established successfully.');
        dbInstance = db;
        return dbInstance;
    } catch (error) {
        Logger.error('Database', 'Failed to connect to the database.', error);
        throw new Error('Failed to connect to the database.');
    }
};